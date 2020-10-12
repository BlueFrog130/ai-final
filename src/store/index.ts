import { Game } from '@/models/game'
import Vue from 'vue'
import Vuex, { ActionTree, GetterTree, MutationTree } from 'vuex'

Vue.use(Vuex)

class RootState {
    game: Game | null = null;
}

const mutations: MutationTree<RootState> = {
    setGame(state, game) {
        state.game = game;
    },
    newGame(state) {
        state.game = Game.create();
    }
}

const actions: ActionTree<RootState, RootState> = {

}

const getters: GetterTree<RootState, RootState> = {

}

export default new Vuex.Store({
    state: new RootState(),
    mutations,
    actions,
    getters,
    modules: {

    }
})
