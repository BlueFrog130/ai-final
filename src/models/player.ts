import { Exclude, Type } from "class-transformer"
import { Board } from './board';
import { Card } from './card';
import { Hand } from './hand';
import * as uuid from "uuid";
import { uniqueNamesGenerator, names } from "unique-names-generator";
import { Action } from './action';

export class Player {
    public id: string;

    @Exclude({ toPlainOnly: true })
    public board: Board;

    public agent: boolean;

    public localPlayer: boolean;

    public name: string;

    public money: number = 2000;

    public folded = false;

    public turnBet = 0;

    public playedRound = false;

    @Type(() => Hand)
    public hand: Hand = new Hand();

    constructor(name: string, board: Board, agent = false, id?: string, localPlayer = false) {
        this.name = name;
        this.board = board;
        this.agent = agent;
        this.id = id || uuid.v4();
        this.localPlayer = localPlayer;
    }

    public static create(name: string, board: Board) {
        return new Player(name, board, undefined, undefined, true);
    }

    public static createAgent(board: Board) {
        return new Player(uniqueNamesGenerator({ dictionaries: [names] }), board, true);
    }

    public get full() {
        return this.hand.full;
    }

    public get broke() {
        return this.money === 0;
    }

    public get actions() {
        let a: Action[] = [];
        if(this.board.currentBet === 0)
            a.push(Action.Check, Action.Bet)
        if(this.board.currentBet > this.turnBet)
            a.push(Action.Call, Action.Raise, Action.Fold)
        return a;
    }

    public get minRaise() {
        return (this.board.currentBet * 2) > this.money ? this.money : (this.board.currentBet * 2);
    }

    public get maxRaise() {
        return this.money;
    }

    public get call() {
        return this.board.currentBet - this.turnBet;
    }

    public deal(card: Card) {
        this.hand.addCard(card);
    }

    public bet(amount: number) {
        let adjusted = 0;
        this.money - amount;
        if(this.money < 0) {
           adjusted = this.money * -1;
           this.money = 0;
        }
        const bet = amount - adjusted;
        this.turnBet = bet;
        this.board.pot += bet;
    }

    public reset() {
        this.hand.card1 = null;
        this.hand.card2 = null;
        this.turnBet = 0;
        this.playedRound = false;
        this.folded = false;
    }

    public play(action: Action) {

    }
}