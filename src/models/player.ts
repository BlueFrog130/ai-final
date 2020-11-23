import { Exclude, Type } from "class-transformer"
import { Board } from './board';
import { Card } from './card';
import { Hand } from './hand';
import * as uuid from "uuid";
import { uniqueNamesGenerator, names } from "unique-names-generator";
import { Action } from './action';
import { Hand as Solver } from "pokersolver"
import StrengthWorker from "worker-loader!@/workers/strength";
import PotentialWorker from "worker-loader!@/workers/potential";
import { Log, Output } from './log';
import { repository } from '@/database/database';
import brain from "brain.js"

const CONFIG = {

}

export class Player {
    public id: string;

    @Exclude({ toPlainOnly: true })
    public board: Board;

    public agent: boolean;

    public localPlayer: boolean;

    public name: string;

    public money: number = 2000;

    public folded = false;

    public turnBet = 0;

    public playedTurn = false;

    @Type(() => Hand)
    public hand: Hand = new Hand();

    @Exclude()
    private net: any = null;

    private jsonNet: object | null = null;

    @Exclude()
    private strengthWorker?: StrengthWorker = undefined;

    @Exclude()
    private potentialWorker?: PotentialWorker = undefined;

    @Type(() => Log)
    public roundLog: Log[] = [];

    public initalizing = true;

    public retraining = false;

    constructor(name: string, board: Board, agent = false, id?: string, localPlayer = false) {
        this.name = name;
        this.board = board;
        this.agent = agent;
        this.id = id || uuid.v4();
        this.localPlayer = localPlayer;
        if(!this.agent) {
            this.initalizing = false;
        }
    }

    public static create(name: string, board: Board) {
        return new Player(name, board, undefined, undefined, true);
    }

    public static createAgent(board: Board) {
        return new Player(uniqueNamesGenerator({ dictionaries: [names] }), board, true);
    }

    public get full() {
        return this.hand.full;
    }

    public get broke() {
        return this.money === 0;
    }

    public get actions() {
        let a: Action[] = [];
        if(this.call === 0)
            a.push(Action.Check, Action.Bet)
        if(this.board.currentBet > this.turnBet)
            a.push(Action.Call, Action.Raise, Action.Fold)
        return a;
    }

    public get minRaise() {
        return (this.board.currentBet * 2) > this.money ? this.money : (this.board.currentBet * 2);
    }

    public get maxRaise() {
        return this.money;
    }

    public get call() {
        return this.board.currentBet - this.turnBet;
    }

    public solver() {
        if(this.hand.normalized.length === 0) {
            return undefined;
        }
        return Solver.solve([...this.hand.normalized, ...this.board.normalized]);
    }

    public get index() {
        return this.board.findPlayerIndex(this);
    }

    public get activeIndex() {
        return this.board.findActivePlayerIndex(this);
    }

    public deal(card: Card) {
        this.hand.addCard(card);
    }

    public bet(amount: number) {
        let adjusted = 0;
        this.money -= amount;
        if(this.money < 0) {
           adjusted = this.money * -1;
           this.money = 0;
        }
        const bet = amount - adjusted;
        this.turnBet += bet;
        this.board.pot += bet;
    }

    public reset() {
        this.hand.card1 = null;
        this.hand.card2 = null;
        this.turnBet = 0;
        this.playedTurn = false;
        this.folded = false;
        this.roundLog = [];
    }

    // Loads data
    public initialize() {
        if(!this.agent) {
            throw new Error("Cannot initialize a non-agent player");
        }
        this.strengthWorker = new StrengthWorker();
        this.potentialWorker = new PotentialWorker();
        this.net = window.makeNeuralNet();
        if(this.jsonNet !== null) {
            this.net.fromJSON(this.jsonNet);
        }
        else {
            this.train();
        }
        this.initalizing = false;
        console.log(this.net);
    }

    /**
     * Adds training data if agent wins
     */
    public async retrain() {
        // if(!this.agent) {
        //     throw new Error("Cannot train a non-agent player");
        // }
        // this.retraining = true;
        // await repository.addData(this.roundLog);
        // this.train();
        // this.retraining = false;
    }

    private async train() {
        const data = await repository.getBaseData();
        this.net.train(data.map(d => d.toTrainingData()));
    }

    public async predict() {
        if(!this.agent) {
            throw new Error("Cannot predict action on a non-agent player");
        }
        const currentBet = (this.board.currentBet / this.money) > 1 ? 1 : (this.board.currentBet / this.money);
        const ehs = await this.effectiveHandStrength();
        let input = { currentBet, ehs };
        const output = this.net.run(input) as Output;
        return {
            input: { currentBet, ehs },
            output
        };
    }

    public serializeNet() {
        if(this.net && this.net.weights) {
            this.jsonNet = this.net.toJSON();
        }
    }

    public async effectiveHandStrength() {
        const HS = await this.getHandStrength();
        if(!this.board.flopDone) {
            return HS;
        }
        const potential = await this.getHandPotential();
        return HS * (1 - potential.NPot) + (1 - HS) * potential.PPot;
    }

    public getHandStrength() {
        return new Promise<number>((resolve, reject) => {
            if(!this.strengthWorker) {
                return reject("Strength worker is not initialized")
            }
            this.strengthWorker.postMessage({ hand: this.hand.normalized, board: this.board.normalized })
            this.strengthWorker.onmessage = e => {
                return resolve(Math.pow(e.data, this.board.players.length - 1));
            }
            this.strengthWorker.onerror = e => {
                return reject(e);
            }
        })
    }

    public getHandPotential() {
        return new Promise<any>((resolve, reject) => {
            if(!this.potentialWorker) {
                return reject("Strength worker is not initialized")
            }
            this.potentialWorker.postMessage({ hand: this.hand.normalized, board: this.board.normalized })
            this.potentialWorker.onmessage = e => {
                return resolve(e.data);
            }
            this.potentialWorker.onerror = e => {
                return reject(e);
            }
        })
    }

    /**
     * Terminates workers
     */
    public cleanup() {
        this.strengthWorker?.terminate();
        this.potentialWorker?.terminate();
    }

    public async getAction() {
        if(!this.agent) {
            throw new Error("Cannot get predicted action on a non-agent");
        }
        const { input, output } = await this.predict();
        console.log(`${this.name} confidence values`, { input, output });
        // get confidence intervals for available actions
        const intervals = this.actions.map(action => {
            switch(action) {
                case Action.Check:
                    return { action, confidence: output.check };
                case Action.Call:
                    return { action, confidence: output.call };
                case Action.Bet:
                    return { action, confidence: output.bet };
                case Action.Raise:
                    return { action, confidence: output.raise };
                case Action.Fold:
                    return { action, confidence: output.fold };
                default:
                    return { action: Action.Unknown, confidence: -1 };
            }
        });
        const best = intervals.reduce((prev, current) => (prev.confidence > current.confidence) ? prev : current);
        const final = { action: best.action, amount: Math.round(output.amount * this.money) };
        if((best.action === Action.Raise || best.action === Action.Bet) && final.amount < this.minRaise) {
            console.log("Agent-defined amount is less than min betting amount")
            if(this.actions.includes(Action.Fold)) {
                best.action = Action.Fold;
            }
            else {
                best.action = Action.Check;
            }
        }
        if(isNaN(final.amount)) {
            final.amount = 0;
        }
        this.roundLog.push(new Log({ player: this, action: final.action, amount: final.amount, total: this.money, currentBet: this.board.currentBet, ehs: input.ehs }));
        return final;
    }
}