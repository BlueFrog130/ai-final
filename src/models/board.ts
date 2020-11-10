import { Exclude, plainToClass, Transform, Type } from "class-transformer"
import { Card } from './card';
import { Deck } from './deck';
import { Player } from './player';
import { Log } from './log';
import { Action } from './action';
import { Hand } from './hand';
import * as uuid from "uuid"
import Solver from "pokersolver"

const FLOP = 3;
const TURN = 1;
const RIVER = 1;

class Turn {
    public number = 0;

    public smallBlind = {
        amount: 100,
        player: -1
    }

    public bigBlind = {
        amount: 200,
        player: -1
    }

    public get smallBlindSet() {
        return !(this.smallBlind.player === -1);
    }

    public get bigBlindSet() {
        return !(this.bigBlind.player === -1);
    }
}

export enum RoundState {
    Waiting,
    Started,
    Finished
}

export class Board {
    public id: string;

    @Type(() => Card)
    public cards: Array<Card> = [];

    @Type(() => Deck)
    public deck = new Deck();

    @Transform((value: Player[]) => value.map(p => p.id), { toPlainOnly: true })
    public players: Array<Player> = [];

    @Transform((value) => value?.id, { toPlainOnly: true })
    public current?: Player = undefined;

    public pot = 0;

    @Type(() => Log)
    public log: Log[] = [];

    /**
     * Tracks current round in game
     */
    public round = 0;

    /**
     * Tracks turn number in round
     */
    @Type(() => Turn)
    public turn = new Turn();

    public initialized = false;

    public currentBet = 0;

    public state = RoundState.Waiting;

    public winner: number[] = [];

    constructor(opts?: { id: string, players?: Player[], current?: string, state?: number, pot?: number, currentBet?: number, initialized?: boolean, log?: Log[], turn?: Turn, round?: number, cards?: Card[], deck?: Deck; }) {
        if(opts) {
            this.id = opts.id;
            if(opts.players) {
                this.players = opts.players;
                this.players.forEach((p) => {
                    p.board = this;
                })
            }
            if(opts.current) {
                this.current = this.players.find(p => p.id === opts.current);
            }
            else {
                this.current = undefined;
            }
            if(opts.currentBet) {
                this.currentBet = opts.currentBet;
            }
            if(opts.initialized) {
                this.initialized = opts.initialized;
            }
            if(opts.pot) {
                this.pot = opts.pot;
            }
            if(opts.state) {
                this.state = opts.state;
            }
            if(opts.log) {
                this.log = plainToClass(Log, opts.log);
            }
            if(opts.turn) {
                this.turn = plainToClass(Turn, opts.turn);
            }
            if(opts.round) {
                this.round = opts.round;
            }
            if(opts.cards) {
                this.cards = plainToClass(Card, opts.cards);
            }
            if(opts.deck) {
                this.deck = plainToClass(Deck, opts.deck);
            }
        }
        else {
            this.id = "";
        }
    }

    public static create() {
        return new Board({ id: uuid.v4() });
    }

    private get flopDone() {
        return this.cards.length >= 3;
    }

    private get turnDone() {
        return this.cards.length >= 4;
    }

    private get riverDone() {
        return this.cards.length == 5;
    }

    public get normalized() {
        return this.cards.map(v => v.id);
    }

    public get values() {
        return this.cards.values();
    }

    public get turnFinished() {
        return this.activePlayers.every(v => v.turnBet === this.currentBet && v.playedTurn);
    }

    public get activePlayers() {
        return this.players.filter(p => !p.folded);
    }

    private add(...cards: Card[]) {
        if((this.cards.length + cards.length) > 5) {
            throw new Error(`Cannot add ${cards.length} cards to board`);
        }
        this.cards.concat(cards);
    }

    public addPlayer(name: string) {
        this.players.push(Player.create(name, this));
    }

    public addAgent() {
        this.players.push(Player.createAgent(this));
    }

    private dealFlop() {
        console.log("attempting flop...")
        if(this.flopDone)
            return;
        console.log("flopping!")
        for(let i = 0; i < FLOP; i++) {
            this.add(this.deck.draw());
        }
    }

    private dealTurn() {
        if(this.turnDone)
            return;
        for(let i = 0; i < TURN; i++) {
            this.add(this.deck.draw())
        }
    }

    private dealRiver() {
        if(this.riverDone)
            return;
        for(let i = 0; i < RIVER; i++) {
            this.add(this.deck.draw())
        }
    }

    public dealBoard() {
        console.log("dealing board")
        if(!this.flopDone)
            this.dealFlop();
        else if(!this.turnDone)
            this.dealTurn();
        else if(!this.riverDone)
            this.dealRiver();
    }

    public async deal(ms?: number) {
        await this.deck.deal(this.players, ms);
    }

    private init() {
        if(this.players.length < 2) {
            throw new Error("Need 2 or more players");
        }
        if(this.turn.smallBlind.player === -1 || this.turn.bigBlind.player === -1) {
            this.turn.smallBlind.player = 0;
            this.getPlayer(this.turn.smallBlind.player).bet(this.turn.smallBlind.amount);
            this.turn.bigBlind.player = 1;
            this.getPlayer(this.turn.bigBlind.player).bet(this.turn.bigBlind.amount);
        }
        this.initialized = true;
    }

    private getPlayer(player: number) {
        return this.players[player];
    }

    public findPlayer(player: Player) {
        for(let i = 0, l = this.players.length; i < l; i++) {
            if(player === this.players[i]) {
                return i;
            }
        }
        return -1;
    }

    public findActivePlayer(player: Player) {
        for(let i = 0, l = this.activePlayers.length; i < l; i++) {
            if(player === this.activePlayers[i]) {
                return i;
            }
        }
        return -1;
    }

    private nextPlayer(player: Player | number): Player {
        let idx = typeof player === "number" ? player : this.findActivePlayer(player);
        let p = this.activePlayers[(idx + 1) % this.activePlayers.length];
        return p;
    }

    public startRound() {
        console.log(this);
        this.round++;
        this.pot = 0;
        this.turn.number = 1;
        this.winner = [];
        this.deck.reset();
        this.players.forEach(p => p.reset());

        if(!this.initialized) {
            this.init();
        }
        else {
            if(!this.turn.smallBlindSet || !this.turn.bigBlindSet) {
                throw new Error("Failed to initialize");
            }
            this.turn.smallBlind.player = (this.turn.smallBlind.player + 1) % this.players.length;
            this.getPlayer(this.turn.smallBlind.player).bet(this.turn.smallBlind.amount);

            this.turn.bigBlind.player = (this.turn.bigBlind.player + 1) % this.players.length;
            this.getPlayer(this.turn.bigBlind.player).bet(this.turn.bigBlind.amount);
        }
        if(!this.turn.smallBlindSet || !this.turn.bigBlindSet) {
            throw new Error("Failed to initialize");
        }

        this.current = this.nextPlayer(this.turn.bigBlind.player);
        this.currentBet = this.turn.bigBlind.amount;
        this.deck.deal(this.players);
        this.state = RoundState.Started;
    }

    public nextTurn() {
        this.turn.number++;
        this.currentBet = 0;
        this.players.forEach(p => {
            p.turnBet = 0;
            p.playedTurn = false
        });
        this.dealBoard();
    }

    public action(player: Player, action: Action, amount = 0) {
        let log = new Log();
        log.player = player.id;
        log.round = this.round;
        log.turn = this.turn.number;
        switch(action) {
        case Action.Fold:
            player.folded = true;
            log.action = Action.Fold;
            break;
        case Action.Check:
            // do nothing
            log.action = Action.Check;
            break;
        case Action.Call:
            player.bet(player.call);
            log.action = Action.Call;
            log.amount = player.call;
            break;
        case Action.Raise:
            // Must DOUBLE the bet
            player.bet(amount);
            this.currentBet = amount;
            log.action = Action.Raise;
            log.amount = amount;
            break;
        case Action.Bet:
            // Cannot be a current bet
            player.bet(amount);
            this.currentBet = amount;
            log.action = Action.Bet;
            log.amount = amount;
            break;
        }
        this.log.push(log);
        player.playedTurn = true;
    }

    public play(action?: { action: Action, amount?: number }) {
        switch(this.state)
        {
            case RoundState.Waiting:
                console.log("Starting round...");
                this.startRound();
                break;
            case RoundState.Finished:
                console.log("Next round...");
                this.startRound();
                break;
            case RoundState.Started:
                console.log("Playing...");
                if(!this.current)
                    throw new Error("No Current player");
                if(!action)
                    throw new Error("No action passed");
                this.action(this.current, action.action, action.amount);

                // Win conditions
                if(this.activePlayers.length === 1) {
                    let winningPlayer = this.activePlayers[0];
                    let winningIndex = this.findPlayer(winningPlayer);
                    if(winningIndex === -1) {
                        throw new Error("No winner??");
                    }
                    this.winner = [winningIndex];
                    winningPlayer.money += this.pot;
                    this.pot = 0;
                    this.state = RoundState.Finished;
                }
                if(this.turnFinished && this.riverDone) {
                    // check for winner
                    let winningHand = Solver.winners(this.activePlayers.map(s => s.solverHand));
                    if(!Array.isArray(winningHand)) {
                        winningHand = [winningHand];
                    }
                    for(const wh of winningHand) {
                        let winningPlayer = this.activePlayers.find(p => p.solverHand === wh);
                        if(!winningPlayer) {
                            throw new Error("Cannot find winning player");
                        }
                        console.log(this.pot / winningHand.length);
                        winningPlayer.money += (this.pot / winningHand.length);
                        this.winner.push(this.findPlayer(winningPlayer));
                    }
                    this.pot = 0;
                    this.state = RoundState.Finished;
                }

                // Start next turn
                if(this.state !== RoundState.Finished) {
                    this.current = this.nextPlayer(this.current);
                    if(this.turnFinished) {
                        console.log("Starting next turn!")
                        this.nextTurn();
                    }
                }
                break;
        }
    }
}