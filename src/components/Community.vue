<template>
    <div class="community">
        <h2>
            ${{ board.pot }}
        </h2>
        <div>
            <card-slot ref="base" :cards="length" />
        </div>
        <template v-for="i in 5">
            <card-slot outlined :hide="cards[i - 1] === undefined" :cards="cards[i - 1]" :key="i" />
        </template>
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
}
</script>

<style lang="scss">
.community {
    height: 100%;
    width: 90%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    & > *:not(:last-child) {
        margin-right: 10px;
    }
}
</style>