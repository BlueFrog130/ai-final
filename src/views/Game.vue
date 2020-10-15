<template>
    <div class="game">
        <close :game="game" />
        <div class="play-area">
            <div class="other">

            </div>
            <div class="player">

            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import Close from "@/components/Close.vue"
import { Game } from '@/models/game';
import { Player } from '@/models/player';

@Component({
    name: "Game",
    components: {
        Close
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
    .other {
        flex-grow: 1;
    }
}
</style>