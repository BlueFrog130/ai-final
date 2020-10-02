import { Deck, Hand, Player, Card } from "."

const Flop = 3;
const Turn = 1;
const River = 1;

export class Board {
    private cards: Array<Card> = [];

    private deck = new Deck();

    public players: Array<Player> = [];

    private get flopDone() {
        return this.cards.length >= 3;
    }

    private get turnDone() {
        return this.cards.length >= 4;
    }

    private get riverDone() {
        return this.cards.length == 5;
    }

    public get normalized() {
        return this.cards.map(v => v.id);
    }

    public get values() {
        return this.cards.values();
    }

    private add(...cards: Card[]) {
        if((this.cards.length + cards.length) > 5) {
            throw new Error(`Cannot add ${cards.length} cards to board`);
        }
        this.cards.concat(cards);
    }

    private flop() {
        if(this.flopDone)
            return;
        for(let i = 0; i < Flop; i++) {
            this.add(this.deck.draw());
        }
    }

    private turn() {
        if(this.turnDone)
            return;
        for(let i = 0; i < Turn; i++) {
            this.add(this.deck.draw())
        }
    }

    private river() {
        if(this.riverDone)
            return;
        for(let i = 0; i < River; i++) {
            this.add(this.deck.draw())
        }
    }

    public matches(hand: Hand) {

    }
}