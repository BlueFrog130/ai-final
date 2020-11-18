import "reflect-metadata"
import "es6-shim"
import "pokersolver"
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "@/database/database"

declare global {
    interface Window {
        brain: any
    }
}

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
