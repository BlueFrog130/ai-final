<template>
    <div class="game">
        <close :game="game" />
        <div class="play-area">
            <div class="other">
                <div class="top">
                    <template v-for="player in agents">
                        <div :key="player.id" class="player-slot" >

                        </div>
                    </template>
                </div>
                <div class="middle">
                    <div class="deck">
                        <board :board="game.board" />
                    </div>
                </div>
            </div>
            <div class="player">
                <div class="controls">

                </div>
                <div class="hand">

                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import Close from "@/components/Close.vue"
import { Game } from '@/models/game';
import { Player } from '@/models/player';
import Board from "@/components/Board.vue";

@Component({
    name: "Game",
    components: {
        Close,
        Board
    }
})
export default class GameComponent extends Vue {
    @Prop({ type: Object, required: true })
    private readonly game!: Game;

    private player: Player | null = null;

    private created() {
        this.player = this.game.board.players.find(p => p.localPlayer) || null;
        if(!this.player) {
            throw new Error("Cannot find local player");
        }
        console.log(this.player);
    }

    private get agents() {
        return this.game.board.players.filter(p => !p.localPlayer);
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
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .other {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        .top, .middle {
            height: 100%;
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            > * {
                width: 100%;
                height: 100%;
            }
        }
    }
}
</style>