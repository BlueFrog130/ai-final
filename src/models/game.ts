import { Board } from "./board"
import * as uuid from "uuid"
import { Type } from "class-transformer"

export class Game {
    public id: string = "";

    public name: string = "";

    @Type(() => Board)
    public board!: Board;

    public static create() {
        let game = new Game();
        game.id = uuid.v4();
        game.board = new Board();
        return game;
    }
}