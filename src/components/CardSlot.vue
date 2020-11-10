<template>
    <div class="card-slot" :class="{ outlined, hide }" :style="{ transform: `rotate(${rotate}deg)`, left: left, height: `${height}px` }">
        <div ref="base-container" class="fit">
            <img v-if="!flipped || !base" class="base" :src="back">
            <img v-else class="base" :src="base ? base.img : back" >
        </div>
        <template v-for="i in length">
            <img :key="i" class="stack" :src="back" :style="{ top: '-' + (i/4) + 'px', left: '-' + (i/8) + 'px' }">
        </template>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import { Card } from '@/models/card';
import CardComponent from "@/components/Card.vue"

@Component({
    name: "CardSlot",
    components: {
        "card": CardComponent
    }
})
export default class CardSlot extends Vue {
    @Prop(Boolean)
    private readonly outlined?: boolean;

    @Prop({default: () => [] })
    private readonly cards!: Card[] | Card | number;

    @Prop(Boolean)
    private readonly hide?: boolean;

    @Prop(Boolean)
    private readonly show?: boolean;

    @Prop(Boolean)
    private readonly flipped?: boolean;

    @Prop({ type: String, default: "0%" })
    private readonly left!: number;

    @Prop({ type: Number, default: 0 })
    private readonly rotate!: number;

    @Prop(Number)
    private readonly height?: number;

    private readonly back = require("@/assets/cards/1B.svg");

    private get length() {
        const cards = this.cards === null ? [] : this.cards;
        if(typeof cards === "number")
            return (cards - 1) < 0 ? 0 : cards - 1;
        if(cards instanceof Card)
            return 0;
        return (cards.length - 1) < 0 ? 0 : (cards.length - 1);
    }

    private get base() {
        if(this.cards instanceof Card)
            return this.cards;
        return null;
    }

    public imgHeight() {
        return (this.$refs["base-container"] as HTMLDivElement).clientHeight;
    }
}
</script>

<style lang="scss">
.card-slot {
    padding: 5px;
    position: relative;
    flex-shrink: 1;
    &.outlined {
        border: 2px solid yellow;
        border-radius: 10px;
    }
    &.hide {
        img {
            visibility: hidden;
        }
    }
    img {
        max-width: 100%;
        max-height: 100%;
    }
    .base {
        position: relative;
    }
    .stack {
        position: absolute;
    }
}
</style>