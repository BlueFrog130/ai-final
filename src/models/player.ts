import { Type } from "class-transformer"
import { Card } from './card';
import { Hand } from './hand';

export class Player {
    public name: string;

    @Type(() => Hand)
    public hand: Hand = new Hand();

    constructor(name: string) {
        this.name = name;
    }

    public get full() {
        return this.hand.full;
    }

    public deal(card: Card) {
        this.hand.addCard(card);
    }
}