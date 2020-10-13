import { Board } from './board';
import { Player } from "./player"

export class Agent extends Player {
    private readonly __type = "agent";
    constructor(name: string, board: Board) {
        super(name, board);
    }
}