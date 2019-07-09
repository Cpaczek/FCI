import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    currentPatId: 0
  },
  mutations: {
    setPatId (state, id) {
      state.currentPatId = id
    }
  },
  getters: {
      currentPatId: state => state.currentPatId,
  }
})
