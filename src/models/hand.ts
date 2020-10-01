import { Card, Board } from "."
import Solver from "pokersolver";

export class Hand {
    private card1?: Card;

    private card2?: Card;

    public addCard(card: Card) {
        if(!this.card1)
            this.card1 = card;
        else if(!this.card2)
            this.card2 = card;
        else
            throw new Error("Cannot add more cards");
    }

    public get normalized() {
        let array = [];
        if(this.card1)
            array.push(this.card1.id);
        if(this.card2)
            array.push(this.card2.id);
        return array
    }

    public get full() {
        return this.card1 && this.card2;
    }

    public solve(board: Board) {
        return Solver.solve([...this.normalized, ...board.normalized]);
    }
}