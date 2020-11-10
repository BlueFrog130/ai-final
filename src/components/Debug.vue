<template>
    <div id="debug">
        <div v-for="(v, k) in debugProperties" :key="k">
            <span>{{ k }}</span>:<span>{{ v }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { RoundState } from '@/models/board';
import { Game } from '@/models/game'
import { classToClass } from 'class-transformer';
import { Vue, Component, Prop } from "vue-property-decorator"

@Component({
    name: "Debug"
})
export default class Debug extends Vue {
    @Prop({ type: Object, required: true })
    private readonly game!: Game;

    private readonly debugProperties = {
        "board.round": this.game.board.round,
        "board.currentBet": this.game.board.currentBet,
        "board.state": RoundState[this.game.board.state],
        "board.winner": this.game.board.winner
    }
}
</script>

<style lang="scss">
#debug {
    position: absolute;
    top: 10px;
    left: 10px;
    background: white;
    color: rgb(150, 0, 0);
    padding: 2px;
    span:first-child {
        margin-right: 3px;
    }
    span:last-child {
        float: right;
        margin-left: 3px;
    }
}
</style>