<template>
  <div id="app">
    <vUpdate ref="update"></vUpdate>
    <vConfirm ref="confirm"></vConfirm>
    <section class="section">
      <div class="container">
        <div class="has-text-centered">
          <label class="has-text-centered" style="font-size: 5em" for="input">Enter Last Name</label>
        </div>

        <input type="text" id="input" v-model="inputlname" class="input">
        <div class="has-text-centered">
          <a href="#" @click="submitLname()" class="button">Enter</a>
        </div>

      </div>
    </section>


  </div>
</template>

<script>

  import bulma from 'bulma/css/bulma.css'

  import vUpdate from './components/vUpdate.vue'
  import vConfirm from './components/vConfirm.vue'
  import EventBus from './event-bus'

  export default {
    data: () => {
      return {
        inputlname: "",
      }

    },
    components: {
      vUpdate,
      vConfirm
    },
    mounted () {
      EventBus.$on('clear', () => {
          this.inputlname ="";
      });
    },
    methods: {
      submitLname(){
          console.log("emit to vconfirm")
          let payload = this.inputlname;
        EventBus.$emit('UpdateAppts', payload)
      }
    }
  }

</script>

<style>
  body {
    background-color: white;
  }

  .modal-content {
    width: 100%;
  }

  h1 {
    font-size: 5em;
  }

  .input {
    margin-bottom: 10px;
  }

  .modal-background {
    /*background-color: rgba(255, 255, 255, 0.48);*/
  }

  .modal-content {
    padding: 100px;
    background-color: white;
  }

  .modal-close {
    background-color: black;
    color: black;
  }

  .margin-auto {
    margin: auto;
  }

  table {
    margin: auto;
    margin-bottom: 10px;
  }

</style>
