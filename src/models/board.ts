import { Agent } from "./agent";
import { Type } from "class-transformer"
import { Card } from './card';
import { Deck } from './deck';
import { Player } from './player';
import { Log } from './log';
import { Action } from './action';

const Flop = 3;
const Turn = 1;
const River = 1;

interface Blind {
    amount: number
    player?: Player | Agent
}

export class Board {

    @Type(() => Card)
    private cards: Array<Card> = [];

    @Type(() => Deck)
    private deck = new Deck();

    @Type(() => Player, {
        discriminator: {
            property: "__type",
            subTypes: [
                { value: Agent, name: "agent" }
            ]
        },
        keepDiscriminatorProperty: true
    })
    public players: Array<Player | Agent> = [];

    public current?: Player | Agent = undefined;

    public pot = 0;

    public smallBlind: Blind = {
        amount: 100,
        player: undefined
    }

    public bigBlind: Blind = {
        amount: 200,
        player: undefined
    }

    public log: Log[] = [];

    /**
     * Tracks current round in game
     */
    public round = 0;

    /**
     * Tracks turn number in round
     */
    public turn = 0;

    private initialized = false;

    private currentBet = 0;

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
        this.players.push(new Player(name, this));
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