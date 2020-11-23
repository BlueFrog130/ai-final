<template>
    <div class="community">
        <div class="row">
            <h3>
                Pot: ${{ board.pot }} |
            </h3>
            <h3 v-if="winnerText || board.lastAction">
                {{ winnerText || board.lastAction }}
            </h3>
        </div>
        <div class="row">
            <div>
                <card-slot ref="base" :cards="length" />
            </div>
            <template v-for="i in 5">
                <card-slot outlined :hide="cards[i - 1] === undefined" :cards="cards[i - 1]" :key="i" flipped />
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { Board } from '@/models/board'
import { Vue, Component, Prop } from "vue-property-decorator"
import CardSlot from "@/components/CardSlot.vue"

@Component({
    name: "Community",
    components: {
        CardSlot
    }
})
export default class community extends Vue {
    @Prop({ type: Object, required: true })
    private readonly board!: Board;

    private get length() {
        return this.board.deck.length;
    }

    public imgHeight() {
        return (this.$refs["base"] as CardSlot).imgHeight();
    }

    public get cards() {
        return this.board.cards;
    }

    public get winnerText() {
        if(this.board.winner.length === 0) {
            return undefined;
        }
        const names = this.board.winner.map(v => this.board.getPlayer(v).name);
        let str = "";
        for(const name of names) {
            str += `${name},`
        }
        str = `${str.slice(0, -1)} won with ${this.board.winningDescr}`;
        return str;
    }
}
</script>

<style lang="scss">
.community {
    height: 100%;
    width: 90%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    > .row {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        & > *:not(:last-child) {
            margin-right: 10px;
        }
    }
}
</style>