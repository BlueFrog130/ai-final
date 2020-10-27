<template>
    <div class="load-game">
        <close />
        <template v-if="loading">
            <h5>Loading...</h5>
        </template>
        <template v-else-if="games.length == 0">
            <h5>No Games Found</h5>
        </template>
        <template v-else v-for="(game, index) in games">
            <div class="game-display" :key="index" @click="load(game.id)">
                <div>
                    <h4>{{ game.name }}</h4>
                    <p class="subtitle">{{ game.id }}</p>
                </div>
                <div>
                    <div @click.stop="remove(game.id)" class="delete">x</div>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator"
import { Game } from '@/models/game'
import Close from "@/components/Close.vue"

@Component({
    name: "LoadGame",
    components: {
        Close
    }
})
export default class LoadGame extends Vue {
    private loading = false;
    private games: { name: string, id: string }[] = [];

    private created() {
        this.fetch()
    }

    private fetch() {
        this.loading = true;
        Game.getGames().then((v) => {
            this.games = v;
            this.loading = false;
        });
    }

    private async load(id: string) {
        const game = await Game.load(id);
        // @ts-ignore
        this.$router.push({ name: "Game", params: { game } });
    }

    private async remove(id: string) {
        let game = await Game.load(id);
        await game.delete();
        this.fetch();
    }
}
</script>

<style lang="scss">
.load-game {
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.game-display {
    display: flex;
    border: 2px solid #2e2e2e;
    background: #d3d3d3;
    color: #2e2e2e;
    justify-content: space-between;
    align-items: center;
    transition: all ease 0.2s;
    &:hover {
        color: #ffffff;
        background:#f6b93b;
        transition: all ease 0.2s;
        .subtitle {
            color: #f5f5f5;
            transition: all ease 0.2s;
        }
    }
    h4, p {
        margin: 0;
        padding: 0.5em 0;
    }
    > *:not(:last-child) {
        padding: 1em;
        margin-right: 2rem;
    }
    .subtitle {
        color: #838383;
        transition: all ease 0.2s;
    }
}

.delete {
    border: none;
    background: none;
    margin: 0;
    padding: 0.5em;
    color: #2e2e2e;
    transition: color ease 0.2s;
    font-weight: bold;
    font-size: 2em;
    cursor: pointer;
    &:hover {
        color: red;
        transition: color ease 0.2s;
    }
}
</style>