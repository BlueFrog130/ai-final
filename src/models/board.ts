import { Exclude, Transform, Type } from "class-transformer"
import { Card } from './card';
import { Deck } from './deck';
import { Player } from './player';
import { Log } from './log';
import { Action } from './action';
import { Hand } from './hand';
import * as uuid from "uuid"

const FLOP = 3;
const TURN = 1;
const RIVER = 1;

class Turn {
    public number = 0;

    public smallBlind = {
        amount: 100,
        player: -1
    }

    public bigBlind = {
        amount: 100,
        player: -1
    }

    public get smallBlindSet() {
        return !(this.smallBlind.player === -1);
    }

    public get bigBlindSet() {
        return !(this.bigBlind.player === -1);
    }
}

export enum RoundState {
    Waiting,
    Started,
    Finished
}

export class Board {
    public id: string;

    @Type(() => Card)
    public cards: Array<Card> = [];

    @Type(() => Deck)
    public deck = new Deck();

    @Transform((value: Player[]) => value.map(p => p.id), { toPlainOnly: true })
    public players: Array<Player> = [];

    @Transform((value) => value?.id, { toPlainOnly: true })
    public current?: Player = undefined;

    public pot = 0;

    @Type(() => Log)
    public log: Log[] = [];

    /**
     * Tracks current round in game
     */
    public round = 0;

    /**
     * Tracks turn number in round
     */
    @Type(() => Turn)
    public turn = new Turn();

    public initialized = false;

    public currentBet = 0;

    public state = RoundState.Waiting;

    constructor(opts?: { id: string, players?: Player[], current?: string }) {
        if(opts) {
            this.id = opts.id;
            if(opts.players) {
                this.players = opts.players;
                this.players.forEach((p) => {
                    p.board = this;
                })
            }
            if(opts.current) {
                this.current = this.players.find(p => p.id === opts.current);
            }
            else {
                this.current = undefined;
            }
        }
        else {
            this.id = "";
        }
    }

    public static create() {
        return new Board({ id: uuid.v4() });
    }

    private get flopDone() {
        return this.cards.length >= 3;
    }

    private get turnDone() {
        return this.cards.length >= 4;
    }

    private get riverDone() {
        return this.cards.length == 5;
    }

    public get normalized() {
        return this.cards.map(v => v.id);
    }

    public get values() {
        return this.cards.values();
    }

    private add(...cards: Card[]) {
        if((this.cards.length + cards.length) > 5) {
            throw new Error(`Cannot add ${cards.length} cards to board`);
        }
        this.cards.concat(cards);
    }

    public addPlayer(name: string) {
        this.players.push(Player.create(name, this));
    }

    public addAgent() {
        this.players.push(Player.createAgent(this));
    }

    private dealFlop() {
        if(this.flopDone)
            return;
        for(let i = 0; i < FLOP; i++) {
            this.add(this.deck.draw());
        }
    }

    private dealTurn() {
        if(this.turnDone)
            return;
        for(let i = 0; i < TURN; i++) {
            this.add(this.deck.draw())
        }
    }

    private dealRiver() {
        if(this.riverDone)
            return;
        for(let i = 0; i < RIVER; i++) {
            this.add(this.deck.draw())
        }
    }

    public dealBoard() {
        if(!this.flopDone)
            this.dealFlop();
        else if(!this.turnDone)
            this.dealTurn();
        else if(!this.riverDone)
            this.dealRiver();
    }

    public async deal(ms?: number) {
        await this.deck.deal(this.players, ms);
    }

    private init() {
        if(this.players.length < 2) {
            throw new Error("Need 2 or more players");
        }
        if(this.turn.smallBlind.player === -1 || this.turn.bigBlind.player === -1) {
            this.turn.smallBlind.player = 0;
            this.getPlayer(this.turn.smallBlind.player).bet(this.turn.smallBlind.amount);
            this.turn.bigBlind.player = 1;
            this.getPlayer(this.turn.bigBlind.player).bet(this.turn.bigBlind.amount);
        }
        this.initialized = true;
    }

    private getPlayer(player: number) {
        return this.players[player];
    }

    private findPlayer(player: Player) {
        for(let i = 0, l = this.players.length; i < l; i++) {
            if(player === this.players[i]) {
                return i;
            }
        }
        return -1;
    }

    private nextPlayer(player: Player | number) {
        let idx = typeof player === "number" ? player : this.findPlayer(player);
        return this.players[(idx + 1) % this.players.length];
    }

    public startRound() {
        console.log(this);
        this.round++;
        this.pot = 0;
        this.turn.number = 1;
        this.deck.reset();
        if(!this.initialized) {
            this.init();
        }
        else {
            if(!this.turn.smallBlindSet || !this.turn.bigBlindSet) {
                throw new Error("Failed to initialize");
            }
            this.turn.smallBlind.player = (this.turn.smallBlind.player + 1) % this.players.length;
            this.getPlayer(this.turn.smallBlind.player).bet(this.turn.smallBlind.amount);

            this.turn.bigBlind.player = (this.turn.bigBlind.player + 1) % this.players.length;
            this.getPlayer(this.turn.bigBlind.player).bet(this.turn.bigBlind.amount);
        }
        if(!this.turn.smallBlindSet || !this.turn.bigBlindSet) {
            throw new Error("Failed to initialize");
        }
        this.current = this.nextPlayer(this.turn.bigBlind.player);
        this.players.forEach(p => p.reset());
        this.currentBet = this.turn.bigBlind.amount;
        this.deck.deal(this.players);
        this.state = RoundState.Started;
    }

    public nextTurn() {
        this.turn.number++;
        this.currentBet = 0;
        this.players.forEach(p => p.turnBet = 0);
    }

    public action(player: Player, action: Action, amount = 0) {
        switch(action) {
        case Action.Fold:
            player.folded = true;
            break;
        case Action.Check:
            // do nothing
            break;
        case Action.Call:

            break;
        case Action.Raise:
            // Must DOUBLE the bet

            break;
        case Action.Bet:
            // Cannot be a current bet
            break;
        }
    }

    public play() {

    }
}