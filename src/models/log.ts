import { Action } from './action';
import { Player } from './player';

interface opts {
    action: Action
    player?: string | Player
    amount: number
    currentBet: number
    ehs: number
    total: number
}

export interface Input {
    currentBet: number
    ehs: number
}

export interface Output {
    check: number
    call: number
    bet: number
    raise: number
    fold: number
    amount: number
}

export class Log {
    public player: string | null;

    constructor(options: opts) {
        if(!options) {
            this.player = null;
            this.amount = 0;
            this.currentBet = 0;
            this.ehs = 0
            return;
        }
        const { action, player, amount, currentBet, ehs, total } = options;
        if(player) {
            this.player = player instanceof Player ? player.id : player;
        }
        else {
            this.player = null;
        }

        switch(action) {
            case Action.Check:
                this.check = 1;
                break;
            case Action.Call:
                this.call = 1;
                break;
            case Action.Bet:
                this.bet = 1;
                break;
            case Action.Raise:
                this.raise = 1;
                break;
            case Action.Fold:
                this.fold = 1;
                break;
        }

        this.amount = (amount / total) > 1 ? 1 : amount / total;
        this.currentBet = (currentBet / total) > 1 ? 1 : currentBet / total;
        this.ehs = ehs;
    }

    private check = 0;

    private call = 0;

    private bet = 0;

    private raise = 0;

    private fold = 0;

    /** ratio amount to money */
    public amount: number;

    /** ratio of current bet to money */
    public currentBet: number;

    public ehs: number;

    public toTrainingData(): { input: Input, output: Output } {
        return {
            input: {
                currentBet: this.currentBet,
                ehs: this.ehs,
            },
            output: {
                check: this.check,
                call: this.call,
                bet: this.bet,
                raise: this.raise,
                fold: this.fold,
                amount: this.amount
            }
        }
    }
}