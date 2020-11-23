import { Exclude, plainToClass, Transform, Type } from "class-transformer"
import { Card } from './card';
import { Deck } from './deck';
import { Player } from './player';
import { Action } from './action';
import * as uuid from "uuid"
import { Hand } from "pokersolver"
import { Log } from './log';

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

    public winningDescr = "";

    public lastAction = "";

    public autoPlay = false;

    private agentPlaying = false;

    constructor(opts?: { id: string, players?: Player[], current?: string, state?: number, pot?: number, currentBet?: number, initialized?: boolean, turn?: Turn, round?: number, cards?: Card[], deck?: Deck; autoPlay: boolean }) {
        if(opts) {
            this.id = opts.id;
            this.autoPlay = opts.autoPlay;
            if(opts.players) {
                this.players = opts.players;
                this.players.forEach((p) => {
                    p.board = this;
                    if(p.agent) {
                        p.initialize();
                    }
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
        this.startAutoPlay();
    }

    public static create(auto = false) {
        return new Board({ id: uuid.v4(), autoPlay: auto });
    }

    public get flopDone() {
        return this.cards.length >= 3;
    }

    public get turnDone() {
        return this.cards.length >= 4;
    }

    public get riverDone() {
        return this.cards.length == 5;
    }

    public get normalized() {
        return this.cards.map(v => v.id);
    }

    public get values() {
        return this.cards.values();
    }

    public get turnFinished() {
        return this.activePlayers.every(v => (v.turnBet === this.currentBet || v.broke) && v.playedTurn);
    }

    public get activePlayers() {
        return this.players.filter(p => !p.folded);
    }

    public get agents() {
        return this.players.filter(p => p.agent);
    }

    private add(...cards: Card[]) {
        if((this.cards.length + cards.length) > 5) {
            throw new Error(`Cannot add ${cards.length} cards to board`);
        }
        this.cards = this.cards.concat(cards);
    }

    public addPlayer(name: string) {
        this.players.push(Player.create(name, this));
    }

    public addAgent() {
        this.players.push(Player.createAgent(this));
    }

    private dealFlop() {
        if(this.flopDone)
            return;
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
        if(!this.flopDone)
            this.dealFlop();
        else if(!this.turnDone)
            this.dealTurn();
        else if(!this.riverDone)
            this.dealRiver();
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

    public getPlayer(player: number) {
        return this.players[player];
    }

    public findPlayerIndex(player: Player) {
        for(let i = 0, l = this.players.length; i < l; i++) {
            if(player === this.players[i]) {
                return i;
            }
        }
        return -1;
    }

    public findActivePlayerIndex(player: Player) {
        for(let i = 0, l = this.activePlayers.length; i < l; i++) {
            if(player === this.activePlayers[i]) {
                return i;
            }
        }
        return -1;
    }

    private nextPlayer(player: Player | number): Player {
        let idx = typeof player === "number" ? player : this.findPlayerIndex(player);
        let p = this.players[(idx + 1) % this.players.length];
        if(p.folded) {
            return this.nextPlayer(p);
        }
        return p;
    }

    public startRound() {
        if(this.state === RoundState.Started) {
            throw new Error("Cannot start round when already started!");
        }
        this.round++;
        this.pot = 0;
        this.turn.number = 1;
        this.winner = [];
        this.winningDescr = "";
        this.deck.reset();
        this.cards = [];
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
        this.agentPlay();
    }

    public nextTurn() {
        this.turn.number++;
        this.currentBet = 0;
        this.players.forEach(p => {
            p.turnBet = 0;
            p.playedTurn = false
        });
        this.dealBoard();
        this.agentPlay();
    }

    public action(player: Player, action: Action, amount = 0) {
        if(!player.actions.includes(action)) {
            throw new Error(`Not allowed to ${Action[action]}`);
        }
        switch(action) {
        case Action.Fold:
            player.folded = true;
            break;
        case Action.Check:
            // do nothing
            break;
        case Action.Call:
            player.bet(player.call);
            break;
        case Action.Raise:
            // Must DOUBLE the bet
            player.bet(amount);
            this.currentBet = Number(amount);
            break;
        case Action.Bet:
            // Cannot be a current bet
            player.bet(amount);
            this.currentBet = Number(amount);
            break;
        }
        player.playedTurn = true;
    }

    public play(action?: { action: Action, amount: number, player: Player }) {
        switch(this.state)
        {
            case RoundState.Waiting:
                this.startRound();
                break;
            case RoundState.Finished:
                this.startRound();
                break;
            case RoundState.Started:
                if(!this.current)
                    throw new Error("No Current player");
                if(!action)
                    throw new Error("No action passed");
                if(action.player !== this.current) {
                    throw new Error("Current player doesn't match passed player!");
                }
                if(action.player.money <= 0 || isNaN(action.player.money)) {
                    action.player.money = 0;
                }
                this.action(this.current, action.action, action.amount);

                this.lastAction = `${this.current.name} - ${Action[action.action]} - $${action.amount}`;

                // Win conditions
                if(this.activePlayers.length === 1) {
                    let winningPlayer = this.activePlayers[0];
                    let winningIndex = this.findPlayerIndex(winningPlayer);
                    if(winningIndex === -1) {
                        throw new Error("No winner??");
                    }
                    this.winner = [winningIndex];
                    winningPlayer.money += this.pot;
                    this.pot = 0;
                    this.winningDescr = winningPlayer.solver()?.descr || "";
                    if(winningPlayer.agent)
                        winningPlayer.retrain();
                    this.state = RoundState.Finished;
                    if(this.autoPlay) {
                        this.startRound();
                    }
                }
                if(this.turnFinished && this.riverDone) {
                    // check for winner
                    let playerContainer = this.activePlayers.map(p => {
                        return {
                            player: p,
                            hand: p.solver() as Hand
                        }
                    });
                    let winningHand = Hand.winners(playerContainer.map(s => s.hand));
                    if(!Array.isArray(winningHand)) {
                        winningHand = [winningHand];
                    }
                    for(const wh of winningHand) {
                        let winningPlayer = playerContainer.find(p => p.hand === wh);
                        if(!winningPlayer) {
                            throw new Error("Cannot find winning player");
                        }
                        winningPlayer.player.money += (this.pot / winningHand.length);
                        this.winner.push(this.findPlayerIndex(winningPlayer.player));
                    }
                    this.winningDescr = winningHand[0].descr;
                    this.pot = 0;
                    this.winner.forEach(v => {
                        const player = this.getPlayer(v);
                        if(player.agent) {
                            player.retrain();
                        }
                    })
                    this.state = RoundState.Finished;
                    if(this.autoPlay) {
                        this.startRound();
                    }
                }

                // Start next turn
                if(this.state !== RoundState.Finished) {
                    this.current = this.nextPlayer(this.current);
                    if(this.turnFinished) {
                        this.nextTurn();
                    }
                    else {
                        this.agentPlay();
                    }
                }
                break;
        }
    }

    private agentPlay() {
        if(this.current && this.current.agent && !this.agentPlaying) {
            console.log(`triggering agent play ${this.current.name}`);
            this.agentPlaying = true;
            const agent = this.current;
            this.current.getAction().then(r => {
                this.agentPlaying = false;
                this.play({ player: agent, action: r.action, amount: r.amount });
            })
        }
    }

    public startAutoPlay() {
        if(this.players.length > 0 && this.autoPlay && this.state !== RoundState.Started) {
            this.startRound();
        }
        if(this.state === RoundState.Started) {
            this.agentPlay();
        }
    }
}