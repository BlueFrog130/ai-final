<template>
    <div class="trainer">
        <div v-if="hand.length > 0" class="row">
            <card-slot v-for="(c, i) in hand" :key="i" :cards="c" flipped />
        </div>
        <div v-if="community.length > 0" class="row">
            <card-slot v-for="(c, i) in community" :key="i" :cards="c" flipped />
        </div>
        <div class="row full-width">
            <button @click="next" :disabled="loading">Next</button>
            <h4>${{ money }}</h4>
            <button :disabled="!canCheck || loading" @click="submit(actions.Check)">Check</button>
            <button :disabled="!canCall || loading" @click="submit(actions.Call)">Call ${{ call }}</button>
            <button :disabled="!canFold || loading" @click="submit(actions.Fold)">Fold</button>
            <button :disabled="!canBet || loading" @click="submit(actions.Bet)">Bet ${{ amount }}</button>
            <button :disabled="!canRaise || loading" @click="submit(actions.Raise)">Raise ${{ amount }}</button>
            <div>
                <input v-model="amount" type="range" step="100" :min="minRaise" :max="maxRaise">
                <span class="slider-label">{{ amount }}</span>
            </div>
        </div>
        <h2>{{ solver ? solver.descr : "" }}</h2>
        <h2>{{ ehs || "loading" }}</h2>
        <close />
    </div>
</template>

<script lang="ts">
import { Action } from '@/models/action';
import { Card } from '@/models/card';
import { Deck } from '@/models/deck'
import { Vue, Component } from "vue-property-decorator";
import CardSlot from "@/components/CardSlot.vue";
import Close from "@/components/Close.vue";
import { Hand } from "pokersolver";
import { Log } from '@/models/log';
import { repository } from '@/database/database';
import StrengthWorker from "worker-loader!@/workers/strength";
import PotentialWorker from "worker-loader!@/workers/potential";

@Component({
    name: "Trainer",
    components: {
        CardSlot,
        Close
    }
})
export default class Trainer extends Vue {
    public readonly actions = Action;

    private created() {
        this.next();
    }

    private deck = new Deck();

    private hand: Card[] = [];

    private community: Card[] = [];

    private currentBet = 0;

    private amount = 0;

    private money = 0;

    private minRaise = 0;

    private maxRaise = 0;

    private solver: Hand | null = null;

    private strengthWorker = new StrengthWorker();

    private potentialWorker = new PotentialWorker();

    private players = 0;

    private loading = false;

    private ehs = 0;

    private get canCheck() {
        return this.currentBet === 0;
    }

    private get canCall() {
        return !this.canCheck;
    }

    private get canFold() {
        return !this.canCheck;
    }

    private get canBet() {
        return this.canCheck;
    }

    private get canRaise() {
        return !this.canCheck && this.currentBet * 2 < this.money;
    }

    private get call() {
        return this.currentBet > this.money ? this.money : this.currentBet;
    }

    private get normalizedHand() {
        return this.hand.map(c => c.id);
    }

    private get normalizedCommunity() {
        return this.community.map(c => c.id);
    }

    private async next() {
        this.loading = true;
        this.money = this.getRandomInt(200, 3000);
        this.currentBet = this.getRandomInt(0, 5) === 0 ? 0 : this.getRandomInt(1, 10) * 100;
        this.deck = new Deck();
        this.hand = [this.deck.draw(), this.deck.draw()];
        this.community = [];
        this.players = this.random([2,3,4,5]);
        for(let i = 0, len = this.random([0, 3, 4, 5]); i < len; i++) {
            this.community.push(this.deck.draw());
        }
        this.minRaise = this.currentBet * 2;
        this.maxRaise = this.money;
        this.solver = Hand.solve([...this.normalizedHand, ...this.normalizedCommunity]);
        this.ehs = 0;
        this.ehs = await this.effectiveHandStrength();
        this.loading = false;
    }

    private getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private random<T>(items: T[]) {
        return items[Math.floor(Math.random() * items.length)];
    }

    private async submit(action: Action) {
        let log = new Log({ action, amount: this.amount, currentBet: this.currentBet, ehs: this.ehs, total: this.money });
        await repository.add(log);
        this.next();
    }

    public async effectiveHandStrength() {
        const HS = await this.getHandStrength();
        if(this.community.length < 3) {
            return HS;
        }
        const potential = await this.getHandPotential();
        return HS * (1 - potential.NPot) + (1 - HS) * potential.PPot;
    }

    public getHandStrength() {
        return new Promise<number>((resolve, reject) => {
            this.strengthWorker.postMessage({ hand: this.normalizedHand, board: this.normalizedCommunity })
            this.strengthWorker.onmessage = e => {
                return resolve(Math.pow(e.data, this.players - 1));
            }
            this.strengthWorker.onerror = e => {
                return reject(e);
            }
        })
    }

    public getHandPotential() {
        return new Promise<any>((resolve, reject) => {
            this.potentialWorker.postMessage({ hand: this.normalizedHand, board: this.normalizedCommunity })
            this.potentialWorker.onmessage = e => {
                return resolve(e.data);
            }
            this.potentialWorker.onerror = e => {
                return reject(e);
            }
        })
    }

    private beforeDestroy() {
        this.strengthWorker.terminate();
        this.potentialWorker.terminate();
    }
}
</script>

<style lang="scss">
.trainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
}
.row {
    display: flex;
    align-items: center;
    justify-content: space-around;
    &.full-width {
        width: 100%;
    }
}
</style>