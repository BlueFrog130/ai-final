import { Hand, Agent, Card } from "."

export class Player {
    public name: string;

    private hand: Hand = new Hand();

    private agent?: Agent;

    constructor(name: string, ai?: boolean) {
        this.name = name;
        if(ai)
            this.agent = new Agent();
    }

    public get full() {
        return this.hand.full;
    }

    public deal(card: Card) {
        this.hand.addCard(card);
    }
}