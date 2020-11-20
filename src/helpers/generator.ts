import { Deck } from '@/models/deck';
import { Combination } from 'js-combinatorics';

export class Generator {
    /**
     * Gets possible cards the opponent may have
     */
    public static getPossibleHands(takenCards: string[]) {
        let deck = new Deck().normalized.filter(c => !takenCards.includes(c));
        const it = new Combination(deck, 2);
        let len = it.length > 100 ? Math.round(Number(it.length) * 0.1) : Number(it.length);
        return this.getRandomSubarray(it.toArray(), len);
    }

    /**
     * Only should be ran after flop or river
     * Only takes 10% into account
     */
    public static getPossibleBoards(takenCards: string[], existingBoard: string[]) {
        let deck = new Deck().normalized.filter(c => ![...takenCards, ...existingBoard].includes(c));
        const it = new Combination(deck, 2);
        let len = Math.round(Number(it.length) * 0.1);
        return this.getRandomSubarray(it.toArray(), len);
    }

    private static getRandomSubarray<T>(arr: Array<T>, size: number) {
        var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
        while (i-- > min) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(min);
    }
}