<template>
    <div ref="game" class="game">
        <close :game="game" />
        <div :class="{ void: loading }" class="play-area">
            <div class="opponents" :style="{ height: size }">
                <template v-for="agent in agents">
                    <div :key="agent.id" class="agent-slot" >
                        <div>
                            <h4 :class="{ active: agent === game.board.current, winner: game.board.winner.includes(agent.index) }" >{{ agent.name }}</h4>
                            <h6>${{ agent.money }}</h6>
                        </div>
                        <hand reverse :player="agent" :hide="game.board.state !== 2" :height="imgSize" />
                    </div>
                </template>
            </div>
            <div class="community" :style="{ height: size }">
                <community ref="deck" :board="game.board" />
            </div>
            <div class="player" :style="{ height: size }">
                <div class="controls">
                    <h2 :class="{ active: isTurn, winner: game.board.winner.includes(player.index) }" >{{ player.name }}</h2>
                    <h4>{{ descr }}</h4>
                    <h4>${{ player.money }}</h4>
                    <button :disabled="started" @click="onDeal">Deal</button>
                    <button :disabled="!canCheck" @click="check">Check</button>
                    <button :disabled="!canCall" @click="call">Call ${{ player.call }}</button>
                    <button :disabled="!canFold" @click="fold">Fold</button>
                    <button :disabled="!canBet" @click="amount">Bet ${{ amount }}</button>
                    <button :disabled="!canRaise" @click="raise">Raise ${{ amount }}</button>
                    <div>
                        <input v-model="amount" type="range" :min="player.minRaise" :max="player.maxRaise">
                        <span class="slider-label">{{ amount }}</span>
                    </div>
                </div>
                <hand :height="imgSize" :player="player" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator"
import Close from "@/components/Close.vue"
import { Game } from '@/models/game';
import { Player } from '@/models/player';
import Community from "@/components/Community.vue";
import Hand from "@/components/Hand.vue";
import { RoundState } from '@/models/board';
import { Action } from '@/models/action';
import { Deck } from '@/models/deck';
import Debug from "@/components/Debug.vue";

@Component({
    name: "Game",
    components: {
        Close,
        Community,
        Hand,
        Debug
    }
})
export default class GameComponent extends Vue {
    @Prop({ type: Object, required: true })
    private readonly game!: Game;

    private player: Player | null = null;

    private amount = 0;

    private size = "";

    private imgSize = 0;

    private loading = true;

    private created() {
        this.player = this.game.board.players.find(p => p.localPlayer) || null;
        if(!this.player) {
            throw new Error("Cannot find local player");
        }

        console.log(this.game);
    }

    private mounted() {
        this.onPlayerChange();
        this.setThird();
        this.setImgSize();
        window.addEventListener("resize", this.setThird, false);
        window.addEventListener("resize", this.setImgSize, false);
        setTimeout(() => {
            this.setThird();
            this.setImgSize();
            this.loading = false;
        }, 1000);
    }

    private beforeDestroy() {
        window.removeEventListener("resize", this.setThird);
        window.removeEventListener("resize", this.setImgSize);
    }

    private setThird() {
        this.size = `${(this.$refs["game"] as HTMLDivElement).clientHeight * 0.27}px`;
    }

    private setImgSize() {
        this.imgSize = (this.$refs["deck"] as Community).imgHeight();
    }

    private get solver() {
        return this.player?.solver();
    }

    private get descr() {
        return this.solver?.descr;
    }

    @Watch("game.board.current")
    private onPlayerChange() {
        this.amount = ((this.player as Player).maxRaise + (this.player as Player).minRaise) / 4;
    }

    private get agents() {
        return this.game.board.players.filter(p => !p.localPlayer);
    }

    private get started() {
        return this.game.board.state === RoundState.Started;
    }

    private get isTurn() {
        return this.game.board.current === this.player && this.started;
    }

    private get canCheck() {
        return this.isTurn && this.player?.actions.includes(Action.Check);
    }

    private get canCall() {
        return this.isTurn && this.player?.actions.includes(Action.Call);
    }

    private get canFold() {
        return this.isTurn && this.player?.actions.includes(Action.Fold);
    }

    private get canBet() {
        return this.isTurn && this.player?.actions.includes(Action.Bet);
    }

    private get canRaise() {
        return this.isTurn && this.player?.actions.includes(Action.Raise);
    }

    private onDeal() {
        this.game.board.startRound();
    }

    private check() {
        this.game.board.play({ action: Action.Check });
    }

    private call() {
        this.game.board.play({ action: Action.Call });
    }

    private raise() {
        this.game.board.play({ action: Action.Raise, amount: this.amount });
    }

    private bet() {
        this.game.board.play({ action: Action.Bet, amount: this.amount });
    }

    private fold() {
        this.game.board.play({ action: Action.Fold });
    }
}
</script>

<style lang="scss">
.void {
    visibility: hidden;
}
.game {
    position: relative;
    height: 100%;
    width: 100%;
    z-index: 3;
    h4, h6 {
        margin: 0.25em 0;
        text-align: center;
    }
}
.play-area {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    > * {
        &:not(:last-child) {
            margin-bottom: 10px;
        }
        flex: 1 1 0px;
    }
}
.player, .opponents {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.agent-slot {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    &:not(:last-child) {
        margin-right: 10px;
    }
    h4 {
        transition: color ease 0.5s;
    }
}

.controls {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
    height: 100%;
    > *:not(:last-child) {
        margin-right: 5px;
    }
}

.slider-label {
    font-weight: bold;
}

.community {
    text-align: center;
}

.active {
    color: rgb(22, 197, 255);
}

.winner {
    color: rgb(0, 211, 0);
}
</style>