import { Board } from "./board"
import * as uuid from "uuid"
import { plainToClass, Transform } from "class-transformer"
import { repository } from "@/database/database"
import { Player } from './player';

export class Game {
    public id: string = "";

    public name: string = "";

    public cheat: boolean = false;
    
    public autoTrain: boolean = false;

    @Transform((value: Board) => value.id, { toPlainOnly: true })
    public board!: Board;

    public static create(name: string, cheat = false, autoTrain = false) {
        let game = new Game();
        game.id = uuid.v4();
        game.name = name;
        game.autoTrain = autoTrain;
        game.cheat = cheat;
        game.board = Board.create(autoTrain);
        return game;
    }

    constructor(opts?: { id: string, board: Board, name: string, autoTrain: boolean, cheat: boolean }) {
        if(opts) {
            this.id = opts.id;
            this.name = opts.name
            this.board = opts.board;
            this.cheat = opts.cheat;
            this.autoTrain = opts.autoTrain;
        }
    }

    public static async getGames() {
        return await repository.getGames();
    }

    public static async load(id: string) {
        const dbGame = <any> await repository.get(Game, id);
        const dbBoard = <any> await repository.get(Board, dbGame.board);
        const dbPlayers = <any[]> await Promise.all(dbBoard.players.map((p: string) => repository.get(Player, p)));
        const players = plainToClass(Player, dbPlayers);
        players.filter(p => p.agent).forEach(p => p.initialize());
        const board = new Board({ id: dbBoard.id, players, current: dbBoard.current, state: dbBoard.state, pot: dbBoard.pot, currentBet: dbBoard.currentBet, initialized: dbBoard.initialized, turn: dbBoard.turn, round: dbBoard.round, deck: dbBoard.deck, cards: dbBoard.cards, autoPlay: dbBoard.autoPlay });
        return new Game({ id: dbGame.id, board, name: dbGame.name, cheat: dbGame.cheat, autoTrain: dbGame.autoTrain });
    }

    public async delete() {
        let removing: Promise<any>[] = [];
        this.board.players.forEach(p => p.cleanup());
        removing.push(repository.delete(this), repository.delete(this.board), ...this.board.players.map(p => repository.delete(p)));
        return await Promise.all(removing);
    }

    public async save() {
        const existing = await repository.get(Game, this.id);
        if(existing) {
            await this.delete();
        }
        let promises: Promise<any>[] = [];
        this.board.agents.forEach(p => p.serializeNet());
        this.board.players.forEach(p => p.cleanup());
        promises.push(repository.add(this), repository.add(this.board), ...this.board.players.map(p => repository.add(p)));
        await Promise.all(promises);
    }
}