<template>
    <div class="hand">
        <card-slot
            v-for="(card, i) in cards" :key="i"
            class="card"
            :cards="card.card"
            :flipped="!!card.card"
            :hide="!card.card"
            :rotate="card.skew"
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

    private get cards() {
        if(!this.player) {
            return [];
        }
        return [{card: this.player.hand.card1, skew: -5}, {card: this.player.hand.card2, skew: 5}];
    }
}
</script>

<style lang="scss">
.hand {
    display: flex;
}
</style>