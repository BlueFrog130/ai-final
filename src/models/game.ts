import { Board } from "./board"
import * as uuid from "uuid"
import { Transform, Type } from "class-transformer"

export class Game {
    public id: string = "";

    public name: string = "";

    @Transform((value: Board) => value.id, { toPlainOnly: true })
    public board!: Board;

    public static create() {
        let game = new Game();
        game.id = uuid.v4();
        game.board = Board.create();
        return game;
    }

    public static load(id: string) {

    }

    public save() {

    }
}