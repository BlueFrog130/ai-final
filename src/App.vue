<template>
    <div id="app" class="board-container">
        <div class="board-inner">
            <transition name="fade">
                <router-view/>
            </transition>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator"
import { Game } from "@/models/game";

@Component({
    name: "App"
})
export default class App extends Vue {
    private readonly test = Game.create();

    private created() {
        this.test.board.addPlayer("Adam");
    }
}
</script>

<style lang="scss">
@import "@/styles/site.scss";
</style>
