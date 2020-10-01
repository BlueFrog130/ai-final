import { Card, Value, Suit, Player } from "."

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
    private draw() {
        return this.deck.splice(0, 1)[0];
    }

    /**
     * Evenly round robin deals cards
     */
    public deal(players: Player[]) {
        while(players.some(p => !p.full)) {
            players.forEach(p => {
                let card = this.draw();
                try {
                    p.deal(card);
                } catch(error) {
                    this.deck.unshift(card);
                }
            });
        }
    }
}