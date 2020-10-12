import { Player } from "./player"

export class Agent extends Player {
    private readonly __type = "agent";
    constructor(name: string) {
        super(name);
    }
}