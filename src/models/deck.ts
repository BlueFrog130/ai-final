import { Card } from './card'
import { Suit } from './suit';
import { Value } from './value'

export class Deck {
    private deck: Array<Card> = [];

    public constructor() {
        this.standardSetup()
    }

    public get length() {
        return this.deck.length;
    }

    /**
     * Basic 52 card setup
     */
    private standardSetup() {
        const values = Object.values(Value);
        const suits = Object.values(Suit);
        for(const value of values) {
            for(const suit of suits) {
                this.deck.push(new Card(value, suit));
            }
        }
        this.shuffle();
    }

    /**
     * Shuffles deck
     */
    public shuffle() {
        for(let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    /**
     * Deals x cards
     */
    public deal(amount: number) {
        return this.deck.splice(0, amount);
    }

    public debug() {
        return ""
    }
}