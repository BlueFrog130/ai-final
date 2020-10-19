<template>
    <div class="flip">
        <div class="inner" :class="{ 'flipped': hidden }" :style="style">
            <div class="front">
                <img ref="img-card" :src="card ? card.img : ''" :style="imgStyle" >
            </div>
            <div class="back">
                <img :src="back" :style="imgStyle" >
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

    @Prop(Object)
    private readonly ratio?: number;

    private readonly back = require("@/assets/cards/1B.svg");

    private hidden = false;

    private windowWidth = 0;

    private imageHeight = 0;

    private created() {
        if(this.hideByDefault || !this.card) {
            this.hidden = true;
        }
        // window.addEventListener("resize", this.computeWindowWidth);
        // this.computeWindowWidth();
    }

    // private computeWindowWidth() {
    //     this.windowWidth = window.innerWidth;
    // }

    // private computeImgHeight() {
    //     const img = (this.$refs["img-card"] as HTMLImageElement);
    //     this.imageHeight = img.height;
    // }

    // private beforeDestroy() {
    //     window.removeEventListener("resize", this.computeWindowWidth);
    // }

    // private mounted() {
    //     window.addEventListener("resize", this.computeImgHeight);
    //     this.computeImgHeight();
    // }

    public flip() {
        if(this.card)
            this.hidden = !this.hidden;
    }

    // get imgStyle() {
    //     const style = JSON.parse(JSON.stringify(this.style));

    //     delete style["height"];

    //     return style;
    // }

    // get style() {
    //     const ratio = this.ratio ? (this.ratio > 1 ? this.ratio/100 : this.ratio) : 0.25;
    //     const width = this.windowWidth * ratio;
    //     const style: { [idx: string]: string } = {};

    //     if(this.imageHeight > 0)
    //         style["height"] = `${this.imageHeight}px`;

    //     style["width"] = `${width}px`;

    //     return style;
    // }
}
</script>

<style lang="scss">
.flip {
    position: relative;
    background-color: transparent;
    perspective: 1000px;
    display: inline-block;

    > .inner {
        position: relative;
        width: 100%;
        height: 100%;
        text-align: center;
        transition: transform 0.8s;
        transform-style: preserve-3d;

        img {
            max-width: 100%;
            max-height: 100%;
        }

        &.flipped {
            transform: rotateY(180deg);
        }

        > .front, > .back {
            position: absolute;
            width: 100%;
            height: 100%;
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
