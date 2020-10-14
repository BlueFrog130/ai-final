import { Exclude, Type } from "class-transformer"
import { Board } from './board';
import { Card } from './card';
import { Hand } from './hand';
import * as uuid from "uuid";

export class Player {
    public id: string;

    public board: Board;

    public agent: boolean;

    public name: string;

    public money: number = 2000;

    public folded = false;

    public turnBet = 0;

    public hand: Hand = new Hand();

    constructor(name: string, board: Board, agent = false, id?: string) {
        this.name = name;
        this.board = board;
        this.agent = agent;
        this.id = id || uuid.v4();
    }

    public static create(name: string, board: Board, agent = false, id?: string) {
        return new Player(name, board, agent, id);
    }

    public get full() {
        return this.hand.full;
    }

    public get broke() {
        return this.money === 0;
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
        return bet;
    }
}