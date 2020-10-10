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

@Component({
    name: "App"
})
export default class App extends Vue {

}
</script>

<style lang="scss">
@import "@/styles/site.scss";
</style>
