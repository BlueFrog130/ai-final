import { Card } from "./card"

export class Board {
    private values: Array<Card> = [];

    public add(...cards: Card[]) {
        if((this.length + cards.length) > 5) {
            throw new Error(`Cannot add ${cards.length} cards to board`);
        }
        this.values.concat(cards);
    }

    public get length() {
        return this.values.length;
    }

    [Symbol.iterator]() {
        return this.values.values();
    }

    public matches() {

    }
}