import { Hand, Agent, Card } from "."

export class Player {
    public name: string;

    public hand: Hand = new Hand();

    private agent: Agent | null = null;

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
        console.log(`${this.name} drew a ${card.id}`);
    }
}