import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: "/",
        name: "Menu",
        component: () => import(/* webpackChunkName: "menu" */ "../views/Menu.vue")
    },
    {
        path: "/load",
        name: "Load",
        component: () => import(/* webpackChunkName: "load" */ "../views/LoadGame.vue")
    },
    {
        path: "/new",
        name: "New",
        component: () => import(/* webpackChunkName: "new" */ "../views/NewGame.vue")
    },
    {
        path: "/game",
        name: "Game",
        component: () => import(/* webpackChunkName: "game" */ "../views/Game.vue"),
        props: true
    }
]

const router = new VueRouter({
    mode: process.env.IS_ELECTRON ? 'hash' : 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
