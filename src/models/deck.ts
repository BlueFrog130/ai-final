import { Card } from './card';
import { Player } from './player';
import { Suit } from './suit';
import { Value } from './value';

export class Deck {
    private deck: Array<Card> = [];

    public constructor() {
        this.reset()
    }

    public get length() {
        return this.deck.length;
    }

    /**
     * Basic 52 card setup
     */
    public reset() {
        this.deck = [];
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
     * Draws card
     */
    public draw() {
        return this.deck.splice(0, 1)[0];
    }

    /**
     * Evenly round robin deals cards
     */
    public async deal<T extends Player>(players: T[], ms = 500) {
        while(players.some(p => !p.full)) {
            for(const player of players) {
                const card = this.draw();
                try {
                    player.deal(card);
                } catch(error) {
                    this.deck.unshift(card);
                }
                await this.sleep(ms);
            }
        }
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}