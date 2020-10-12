import { Agent } from "./agent";
import { Type } from "class-transformer"
import { Card } from './card';
import { Deck } from './deck';
import { Player } from './player';

const Flop = 3;
const Turn = 1;
const River = 1;

export class Board {

    @Type(() => Card)
    private cards: Array<Card> = [];

    @Type(() => Deck)
    private deck = new Deck();

    @Type(() => Player, {
        discriminator: {
            property: "__type",
            subTypes: [
                { value: Agent, name: "agent" }
            ]
        },
        keepDiscriminatorProperty: true
    })
    public players: Array<Player | Agent> = [];

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

    public playBoard() {
        if(!this.flopDone)
            this.flop();
        else if(!this.turnDone)
            this.turn();
        else if(!this.riverDone)
            this.river();
    }

    public async deal(ms?: number) {
        await this.deck.deal(this.players, ms);
    }
}