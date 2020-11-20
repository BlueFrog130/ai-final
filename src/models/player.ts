import { Exclude, Type } from "class-transformer"
import { Board } from './board';
import { Card } from './card';
import { Hand } from './hand';
import * as uuid from "uuid";
import { uniqueNamesGenerator, names } from "unique-names-generator";
import { Action } from './action';
import { Hand as Solver } from "pokersolver"
import { Log } from './log';
import StrengthWorker from "worker-loader!@/workers/strength";
import PotentialWorker from "worker-loader!@/workers/potential";

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
    private strengthWorker = new StrengthWorker();

    @Exclude()
    private potentialWorker = new PotentialWorker();

    constructor(name: string, board: Board, agent = false, id?: string, localPlayer = false) {
        this.name = name;
        this.board = board;
        this.agent = agent;
        this.id = id || uuid.v4();
        this.localPlayer = localPlayer;
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
    }

    // Loads data
    public async initialize() {
        console.log(`initalizing agent ${this.name}`)
        this.net = new window.brain.NeuralNetworkGPU();
        // if(this.jsonNet !== null) {
        //     this.net.fromJSON(this.jsonNet);
        // }
        // else {
        //     let base = await repository.getBaseData();
        //     let data = base.map(l => l.toRnnTrainingData());
        //     console.log(data);
        //     this.net.train(data);
        // }
    }

    public train() {
        if(!this.agent) {
            throw new Error("Cannot train a non-agent player");
        }
    }

    public predict() {
        if(!this.agent) {
            throw new Error("Cannot predict action on a non-agent player");
        }
        let input = { currentBet: this.board.currentBet, hand: this.hand.normalized, cards: this.board.normalized };
        console.log(input);
        return Log.fromRnnData(this.net.run(input));
    }

    public serializeNet() {
        if(this.net && this.net.weights) {
            this.jsonNet = this.net.toJSON();
            console.log(this.jsonNet);
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
        this.strengthWorker.terminate();
        this.potentialWorker.terminate();
    }
}