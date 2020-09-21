<template>
    <div id="app">
        <Card :card="card" hide-by-default />
        <button @click="onClick">Add Card</button>
        <button @click="calc">Calc Score</button>
        <router-view/>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator"
import { Deck } from "@/models/deck"
import { Card } from "@/models/card"
import CardComponent from "@/components/Card.vue"
import { Score } from "@/models/score"

@Component({
    name: "App",
    components: {
        "Card": CardComponent
    }
})
export default class App extends Vue {
    private readonly deck = new Deck();

    private card: Card | null = null;

    private cards: Card[] = [];

    private created() {
        // nothing
    }

    onClick() {
        this.cards = this.cards.concat(this.deck.deal(1));
        console.log(this.cards.map(c => c.value));
    }

    calc() {
        console.log(Score.total(this.cards));
    }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #2c3e50;
}
</style>
