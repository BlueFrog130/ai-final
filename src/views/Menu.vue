<template>
    <transition name="slow-fade">
        <div class="menu" v-if="isMounted">
            <h1 class="title">
                Texas Hold'em Poker
            </h1>
            <template v-for="(button, index) in actions">
                <button :key="`action-${index}`" @click="button.action">{{ button.title }}</button>
            </template>
        </div>
    </transition>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator"
import { Game } from "@/models/game"
import { Player } from '@/models/player';
import { Combination } from "js-combinatorics"
import { Deck } from '@/models/deck';
import { Generator } from '@/helpers/generator';

@Component({
    name: "Menu"
})
export default class Menu extends Vue {
    private isMounted = false;

    private mounted() {
        this.isMounted = true;
    }

    private actions = [
        {
            title: "New Game",
            action: () => {
                this.$router.push({ name: "New" });
            }
        },
        {
            title: "Load Game",
            action: () => {
                this.$router.push({ name: "Load" })
            }
        },
        {
            title: "Train Model",
            action: () => {
                this.$router.push({ name: "Trainer" })
            }
        }
    ]
}
</script>

<style lang="scss">
.menu {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
}
.title {
    font-family: PassionOne, Arial, Helvetica, sans-serif;
    letter-spacing: 0.1em;
    text-shadow: 0 0 1em black;
    font-size: 3em;
}
</style>