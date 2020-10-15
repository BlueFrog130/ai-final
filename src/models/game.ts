import { Board } from "./board"
import * as uuid from "uuid"
import { plainToClass, Transform } from "class-transformer"
import { repository } from "@/database/database"
import { Player } from './player';

export class Game {
    public id: string = "";

    public name: string = "";

    @Transform((value: Board) => value.id, { toPlainOnly: true })
    public board!: Board;

    public static create(name: string) {
        let game = new Game();
        game.id = uuid.v4();
        game.name = name;
        game.board = Board.create();
        return game;
    }

    constructor(opts?: { id: string, board: Board, name: string }) {
        if(opts) {
            this.id = opts.id;
            this.name = opts.name
            this.board = opts.board;
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
        const board = new Board({ id: dbBoard.id, players, current: dbBoard.current });
        return new Game({ id: dbGame.id, board, name: dbGame.name });
    }

    public async delete() {
        let removing: Promise<any>[] = [];
        removing.push(repository.delete(this), repository.delete(this.board), ...this.board.players.map(p => repository.delete(p)));
        return await Promise.all(removing);
    }

    public async save() {
        const existing = await repository.get(Game, this.id);
        if(existing) {
            await this.delete();
        }
        let promises: Promise<any>[] = [];
        promises.push(repository.add(this), repository.add(this.board), ...this.board.players.map(p => repository.add(p)));
        await Promise.all(promises);
    }
}