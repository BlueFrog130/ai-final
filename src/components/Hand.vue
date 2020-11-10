<template>
    <div class="hand">
        <card-slot
            v-for="(card, i) in cards" :key="i"
            class="card"
            :class="{ folded }"
            :cards="card.card"
            :flipped="!hide"
            :hide="!card.card"
            :rotate="card.skew"
            :left="card.left"
            :height="height"
            />
    </div>
</template>

<script lang="ts">
import { Player } from '@/models/player'
import { Component, Prop, Vue } from "vue-property-decorator"
import CardSlot from "@/components/CardSlot.vue"

@Component({
    name: "Hand",
    components: {
        CardSlot
    }
})
export default class HandComponent extends Vue {
    @Prop(Object)
    private readonly player?: Player;

    @Prop(Boolean)
    private readonly reverse?: boolean;

    @Prop(Boolean)
    private readonly hide?: boolean;

    @Prop(Number)
    private readonly height?: number;

    private get cards() {
        if(!this.player) {
            return [];
        }
        return [{card: this.player.hand.card1, skew: (this.reverse ? 180 + 5 : -5)}, {card: this.player.hand.card2, skew: (this.reverse ? 180 - 5 : 5), left: '-7.5%'}];
    }

    private get folded() {
        if(this.player) {
            return this.player.folded;
        }
        return false;
    }
}
</script>

<style lang="scss">
.hand {
    display: flex;
    height: 100%;
    img {
        transition: all ease 0.5s;
    }
    .folded {
        img {
            filter: brightness(50%);
        }
    }
}
</style>