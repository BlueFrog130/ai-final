<template>
    <div class="new-game">
        <close />
        <div>
            <label for="name">Game Name</label>
            <input v-model="gameName" id="game" placeholder="Name">
        </div>
        <!-- <div>
            <label type="checkbox" for="auto">Auto-train [Bots only]</label>
            <input v-model="autoTrain" type="checkbox" id="auto">
        </div> -->
        <div v-if="!autoTrain">
            <label for="name">Display Name</label>
            <input v-model="name" id="name" placeholder="Name">
        </div>
        <div>
            <label type="checkbox" for="cheat">Cheat Mode [View Cards]</label>
            <input v-model="cheat" type="checkbox" id="cheat">
        </div>
        <div>
            <div class="selection">
                <h3>Select number of agents</h3>
                <template v-for="i in MAX_AGENTS">
                    <input :key="`input-${i}`" type="radio" :id="i" :value="i" v-model="agents">
                    <label :key="`label-${i}`" type="radio">{{ i }}</label>
                    <br :key="`br-${i}`">
                </template>
            </div>
        </div>
        <button :disabled="disabled" @click="startGame">START</button>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator"
import { Game } from "@/models/game"
import Close from "@/components/Close.vue"

@Component({
    name: "NewGame",
    components: {
        Close
    }
})
export default class NewGame extends Vue {
    private name = "";

    private gameName = "";

    private cheat = false;

    private autoTrain = false;

    private readonly MAX_AGENTS = 5;

    private agents = 0;

    private get disabled() {
        return !this.agents || (!this.name && !this.autoTrain) || !this.gameName;
    }

    private async startGame() {
        const game = Game.create(this.gameName, this.cheat, this.autoTrain);
        if(!this.autoTrain) {
            game.board.addPlayer(this.name);
        }
        for(let i = 0; i < this.agents; i++) {
            game.board.addAgent();
        }
        await game.save();
        const loaded = await Game.load(game.id);
        // @ts-ignore
        this.$router.push({ name: "Game", params: { game: loaded } });
    }
}
</script>

<style lang="scss">
.new-game {
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    input {
        padding: 0.5em;
        &[type=radio] {
            padding: none;
            margin-right: 0.5rem;
        }
    }
    label {
        display: block;
        font-weight: bold;
        margin-bottom: 0.5em;
        &[type=radio] {
            display: inline-block;
        }
        &[type=checkbox] {
            display: inline-block;
            margin-right: 0.5rem;
        }
    }
    > *:not(:last-child) {
        margin-bottom: 2rem;
    }
}
</style>