import { Card } from './card';

interface HandType {
    multiplier: number;
    fn: (cards: Card[]) => number;
}

export class Score {
    public static HAND_TYPE: { [key: string]: HandType } = {
        ONE_PAIR: {
            multiplier: 100,
            fn(cards) {
                const values = new Set(cards.map(c => c.value));
                for(const value of values) {
                    const pair = cards.filter(c => c.value === value);
                    if(pair.length == 2) {
                        return this.multiplier + pair.map(c => c.score).reduce((acc, c) => acc + c);
                    }
                }
                return 0;
            }
        },
        TWO_PAIR: {
            multiplier: 200,
            fn(cards) {
                const values = new Set(cards.map(c => c.value));
                const pairs: Card[][] = [];
                for(const value of values) {
                    const pair = cards.filter(c => c.value === value);
                    if(pair.length == 2) {
                        pairs.push(pair);
                    }
                }
                if(pairs.length == 2) {
                    const tot = pairs
                        .reduce((a, b) => a.concat(b))
                        .map(c => c.score)
                        .reduce((acc, s) => acc + s);
                    return this.multiplier + tot;
                }
                return 0;
            }
        },
        THREE_OF_A_KIND: {
            multiplier: 300,
            fn(cards) {
                return 0;
            }
        },
        STRAIGHT: {
            multiplier: 400,
            fn(cards) {
                return 0;
            }
        },
        FLUSH: {
            multiplier: 500,
            fn(cards) {
                return 0;
            }
        },
        FULL_HOUSE:{
            multiplier: 600,
            fn(cards) {
                return 0;
            }
        },
        FOUR_OF_A_KIND: {
            multiplier: 700,
            fn(cards) {
                return 0;
            }
        },
        STRAIGHT_FLUSH: {
            multiplier: 800,
            fn(cards) {
                return 0;
            }
        }
    }

    public static total(cards: Card[]) {
        let score = 0;
        for(const type of Object.values(Score.HAND_TYPE)) {
            score += type.fn(cards);
        }
        return score;
    }
}