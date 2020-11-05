import Solver from "pokersolver"
import { Type } from "class-transformer"
import { Board } from './board';
import { Card } from './card';

export class Hand {
    @Type(() => Card)
    public card1: Card | null = null;

    @Type(() => Card)
    public card2: Card | null = null;

    public addCard(card: Card) {
        if(!this.card1)
            this.card1 = card;
        else if(!this.card2)
            this.card2 = card;
        else
            throw new Error("Cannot add more cards");
    }

    public get normalized() {
        const array = [];
        if(this.card1)
            array.push(this.card1.id);
        if(this.card2)
            array.push(this.card2.id);
        return array
    }

    public get full() {
        return !!this.card1 && !!this.card2;
    }

    public solve(board: Board) {
        return Solver.solve([...this.normalized, ...board.normalized]);
    }
}