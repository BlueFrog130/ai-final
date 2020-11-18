import { Action } from './action';

export class Log {
    public player: string | null = null;

    public action: Action = Action.Unknown;

    public amount = 0;

    public currentBet = 0;

    public hand: string[] = [];

    public cards: string[] = [];

    public toTrainingData() {
        return {
            input: {
                currentBet: this.currentBet,
                hand: this.hand,
                cards: this.cards
            },
            output: {
                action: this.action,
                amount: this.amount
            }
        }
    }

    public toRnnTrainingData() {
        return {
            input: [this.currentBet, this.hand, this.cards],
            output: [this.action, this.amount]
        }
    }

    public static fromRnnData([action, amount]: [number, number]) {
        return {
            action,
            amount
        }
    }
}