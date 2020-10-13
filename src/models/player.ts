import { Type } from "class-transformer"
import { Board } from './board';
import { Card } from './card';
import { Hand } from './hand';

export class Player {
    public name: string;

    public board: Board;

    public money: number = 2000;

    public folded = false;

    public turnBet = 0;

    @Type(() => Hand)
    public hand: Hand = new Hand();

    constructor(name: string, board: Board) {
        this.name = name;
        this.board = board;
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