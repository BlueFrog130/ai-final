<template>
    <div class="hand">
        <card v-for="(card, i) in cards" :key="i" class="card" :card="card" />
    </div>
</template>

<script lang="ts">
import { Player } from '@/models/player'
import { Component, Prop, Vue } from "vue-property-decorator"

@Component({
    name: "Hand"
})
export default class HandComponent extends Vue {
    @Prop(Object)
    private readonly player?: Player;

    private get cards() {
        if(!this.player) {
            return [];
        }
        return [this.player.hand.card1, this.player.hand.card2];
    }
}
</script>

<style lang="scss">
.hand {
    display: flex;
}
</style>