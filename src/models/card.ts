import { Suit } from './suit';
import { Value } from './value';

export class Card {
    private v: Value;
    private s: Suit;

    public constructor(value: Value, suit: Suit) {
        this.v = value;
        this.s = suit;
    }

    public get img() {
        return require(`@/assets/cards/${this.v}${this.s}.svg`);
    }

    public get value() {
        return this.v;
    }

    public get suit() {
        return this.s;
    }

    public get id() {
        return `${this.v}${this.s.toLowerCase()}`;
    }

    public get score() {
        // Covers 1 - 9
        if(!isNaN(Number(this.v))) {
            // adjusting for ace high
            return Number(this.v) - 1;
        }
        switch(this.v) {
            case Value.TEN:
                return 9;
            case Value.JACK:
                return 10;
            case Value.QUEEN:
                return 11;
            case Value.KING:
                return 12;
            case Value.ACE:
                return 13;
        }
        return 0;
    }
}