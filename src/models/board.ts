import { Card } from "./card"
import { Deck, Hand, Player } from "."

const Flop = 3;
const Turn = 1;
const River = 1;

export class Board {
    private cards: Array<Card> = [];

    private deck = new Deck();

    public players: Array<Player> = [];

    public add(...cards: Card[]) {
        if((this.length + cards.length) > 5) {
            throw new Error(`Cannot add ${cards.length} cards to board`);
        }
        this.cards.concat(cards);
    }

    public get length() {
        return this.cards.length;
    }

    public get normalized() {
        return this.cards.map(v => v.id);
    }

    public get values() {
        return this.cards.values();
    }

    public matches(hand: Hand) {

    }
}