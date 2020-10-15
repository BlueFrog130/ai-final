import { Exclude, Transform, Type } from "class-transformer"
import { Card } from './card';
import { Deck } from './deck';
import { Player } from './player';
import { Log } from './log';
import { Action } from './action';
import { Hand } from './hand';
import * as uuid from "uuid"

const Flop = 3;
const Turn = 1;
const River = 1;

class Blind<T extends Player> {
    public amount: number;

    public player: T | null;

    constructor(amount: number, player: T | null = null) {
        this.amount = amount;
        this.player = player;
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

    @Type(() => Blind)
    public smallBlind = new Blind(100);

    @Type(() => Blind)
    public bigBlind = new Blind(200);

    @Type(() => Log)
    public log: Log[] = [];

    /**
     * Tracks current round in game
     */
    public round = 0;

    /**
     * Tracks turn number in round
     */
    public turn = 0;

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
        for(let i = 0; i < Flop; i++) {
            this.add(this.deck.draw());
        }
    }

    private dealTurn() {
        if(this.turnDone)
            return;
        for(let i = 0; i < Turn; i++) {
            this.add(this.deck.draw())
        }
    }

    private dealRiver() {
        if(this.riverDone)
            return;
        for(let i = 0; i < River; i++) {
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
        if(!this.smallBlind.player || !this.bigBlind.player) {
            this.smallBlind.player = this.players[0];
            this.pot += this.smallBlind.player.bet(this.smallBlind.amount);
            this.bigBlind.player = this.players[1];
            this.pot += this.bigBlind.player.bet(this.bigBlind.amount);
        }
        this.initialized = true;
    }

    private findPlayer<T extends Player>(player: T) {
        for(let i = 0, l = this.players.length; i < l; i++) {
            if(player === this.players[i]) {
                return i;
            }
        }
        return -1;
    }

    private nextPlayer<T extends Player>(player: T) {
        return this.players[(this.findPlayer(player) + 1) % this.players.length];
    }

    public startRound() {
        this.round++;
        this.pot = 0;
        this.turn = 1;
        this.state = RoundState.Started;
        if(!this.initialized) {
            this.init();
        }
        else {
            if(!this.smallBlind.player || !this.bigBlind.player) {
                throw new Error("Failed to initialize");
            }
            let sbIdx = this.findPlayer(this.smallBlind.player);
            if(sbIdx) {
                throw new Error("Player not found");
            }
            this.smallBlind.player = this.players[sbIdx % this.players.length];
            this.pot += this.smallBlind.player.bet(this.smallBlind.amount);
            let bbIdx = this.findPlayer(this.bigBlind.player);
            if(sbIdx) {
                throw new Error("Player not found");
            }
            this.bigBlind.player = this.players[bbIdx % this.players.length];
            this.pot += this.bigBlind.player.bet(this.bigBlind.amount);
        }
        if(!this.smallBlind.player || !this.bigBlind.player) {
            throw new Error("Failed to initialize");
        }
        this.current = this.nextPlayer(this.bigBlind.player);
        this.players.forEach(p => p.turnBet = 0);
        this.currentBet = this.bigBlind.amount;
    }

    public action<T extends Player>(player: T, action: Action, amount = 0) {
        switch(action) {
        case Action.Fold:
            player.folded = true;
            break;
        case Action.Check:
            // do nothing
            break;
        case Action.Call:

            break;
        }
    }
}