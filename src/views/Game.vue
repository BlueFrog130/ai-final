<template>
    <div class="game">
        <close :game="game" />
        <div class="play-area">
            <div class="opponents">
                <template v-for="player in agents">
                    <div :key="player.id" class="player-slot" >

                    </div>
                </template>
            </div>
            <div class="community">
                <community :board="game.board" />
            </div>
            <div class="player">
                <div class="controls">
                    <button :disabled="started" @click="onDeal">Deal</button>
                    <button :disabled="!canCheck">Check</button>
                    <button :disabled="!canCall">Call</button>
                    <button :disabled="!canFold">Fold</button>
                    <button :disabled="!canBet">Bet</button>
                    <button :disabled="!canRaise">Raise</button>
                    <div>
                        <input v-model="bet" type="range" :min="player.minRaise" :max="player.maxRaise">
                        <span class="slider-label">{{ bet }}</span>
                    </div>
                </div>
                <hand :player="player" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import Close from "@/components/Close.vue"
import { Game } from '@/models/game';
import { Player } from '@/models/player';
import Community from "@/components/Community.vue";
import Hand from "@/components/Hand.vue";
import { RoundState } from '@/models/board';
import { Action } from '@/models/action';

@Component({
    name: "Game",
    components: {
        Close,
        Community,
        Hand
    }
})
export default class GameComponent extends Vue {
    @Prop({ type: Object, required: true })
    private readonly game!: Game;

    private player: Player | null = null;

    private bet = 50;

    private created() {
        this.player = this.game.board.players.find(p => p.localPlayer) || null;
        if(!this.player) {
            throw new Error("Cannot find local player");
        }
    }

    private get agents() {
        return this.game.board.players.filter(p => !p.localPlayer);
    }

    private get started() {
        return this.game.board.state === RoundState.Started;
    }

    private get canCheck() {
        return this.player?.actions.includes(Action.Check);
    }

    private get canCall() {
        return this.player?.actions.includes(Action.Call);
    }

    private get canFold() {
        return this.player?.actions.includes(Action.Fold);
    }

    private get canBet() {
        return this.player?.actions.includes(Action.Bet);
    }

    private get canRaise() {
        return this.player?.actions.includes(Action.Raise);
    }

    private onDeal() {
        this.game.board.startRound();
    }
}
</script>

<style lang="scss">
.game {
    position: relative;
    height: 100%;
    width: 100%;
    z-index: 3;
}
.play-area {
    width: 95%;
    height: 95%;
    display: flex;
    flex-direction: column;
    padding: 2.5%;
    > * {
        width: 100%;
        height: 100%;
    }
}
.player {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.controls {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
    height: 100%;
}

.slider-label {
    font-weight: bold;
}
</style>