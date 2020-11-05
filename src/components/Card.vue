<template>
    <div class="flip">
        <div class="inner" :class="{ 'flipped': hidden }">
            <div class="front">
                <img ref="img-card" :src="card ? card.img : back" >
            </div>
            <div class="back">
                <img :src="back" >
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import { Card as CardModel } from "@/models/card"

@Component({
    name: "Card"
})
export default class Card extends Vue {
    @Prop(Object)
    private readonly card?: CardModel;

    @Prop(Boolean)
    private readonly hideByDefault?: boolean;

    private readonly back = require("@/assets/cards/1B.svg");

    private hidden = false;


    private created() {
        if(this.hideByDefault || !this.card) {
            this.hidden = true;
        }
    }

    public flip() {
        if(this.card)
            this.hidden = !this.hidden;
    }
}
</script>

<style lang="scss">
.flip {
    position: relative;
    background-color: transparent;
    perspective: 1000px;

    > .inner {
        position: relative;
        text-align: center;
        transition: transform 0.8s;
        transform-style: preserve-3d;

        img {
            max-width: 100%;
        }

        &.flipped {
            transform: rotateY(180deg);
        }

        > .front, > .back {
            position: absolute;
            backface-visibility: hidden;
        }

        > .front {
            background-color: transparent;
        }

        > .back {
            background-color: transparent;
            transform: rotateY(180deg);
        }
    }
}
</style>
