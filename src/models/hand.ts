import { Board } from './board';
import { Card } from "./card"

export class Hand {
    public cards: [Card, Card];

    public constructor(card1: Card, card2: Card) {
        this.cards = [card1, card2];
    }

    public compute(board: Board) {

    }
}