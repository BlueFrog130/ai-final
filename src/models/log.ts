import { Action } from './action';
import { Board } from './board';
import { Player } from './player';

export class Log {
    public action: Action = Action.Unknown;

    public amount = 0;

    public player: string = "";

    public round = -1;

    public turn = -1;
}