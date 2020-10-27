<template>
    <div class="board">
        <div class="deck">
            <template v-for="i in length">
                <card-slot :key="i" class="deck-card" :style="{ top: '-' + (i/4) + 'px', left: '-' + (i/8) + 'px' }"/>
            </template>
        </div>
        <div class="community">
            <template v-for="i in 5">
                <card-slot :key="i" />
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { Board } from '@/models/board'
import { Vue, Component, Prop } from "vue-property-decorator"
import Card from "@/components/Card.vue"
import CardSlot from "@/components/CardSlot.vue"

@Component({
    name: "Board",
    components: {
        Card,
        CardSlot
    }
})
export default class BoardComponent extends Vue {
    @Prop({ type: Object, required: true })
    private readonly board!: Board;

    private get length() {
        return this.board.deck.length;
    }
}
</script>

<style lang="scss">
.board {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .deck {
        position: relative;
        height: 100%;
        width: 100%;
        .deck-card {
            position: absolute;
        }
    }
    .community {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        & > *:not(:last-child) {
            margin-right: 10px;
        }
    }
    .cards {
        height: 100%;
        width: 100%;
    }
}
</style>