<template>
    <div class="close" @click="quit">x</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import { Game } from '@/models/game'

@Component({
    name: "Close"
})
export default class Close extends Vue {
    @Prop(Object)
    private readonly game?: Game;

    private async quit() {
        if(this.game) {
            await this.game.save();
        }
        this.$router.push({ name: "Menu" });
    }
}
</script>

<style lang="scss">
.close {
    position: absolute;
    color: #f5f5f5;
    transition: color ease 0.2s;
    font-weight: bold;
    font-size: 2em;
    top: 0.5em;
    right: 0.5em;
    cursor: pointer;
    &:hover {
        color: red;
        transition: color ease 0.2s;
    }
}
</style>