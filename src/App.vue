<template>
  <div id="app">

    <section class="section">
      <div class="container textbox">
        <div class="has-text-centered">
          <label class="has-text-centered" style="font-size: 5em" for="input">Enter Last Name</label>
        </div>

        <input type="text" id="input" v-model="inputlname" class="input">
        <div class="has-text-centered">
          <a href="#" @click="submit()" class="button">Enter</a>
        </div>

      </div>
    </section>
    <div class="modal" v-bind:class="{ 'is-active': isActive }">
      <div class="modal-background"></div>
      <div class="modal-content">
        <table class="table is-bordered">
          <thead>
          <tr>
            <th>Appointment Time</th>
            <th>Full Name</th>
            <th>Check In</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="appt in appts">
            <td>{{appt.Time}}</td>
            <td>{{appt.First}} {{appt.Last}}</td>

            <td v-if="appt.conf < 269 || appt.conf > 268"><a class="button" @click="confirm(appt.apt)">Check In</a></td>
            <td v-else><a class="button" disabled>Checked In</a></td>
          </tr>
          </tbody>
        </table>
      </div>
      <button class="modal-close is-large" aria-label="close" @click="clearmodal()"></button>
    </div>
    <div class="text-has-centered">
        <h1 >Scroll up</h1>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import App from './App.vue'
  import axios from 'axios';
  import bulma from 'bulma/css/bulma.css'
  import Swal from 'sweetalert2'

  export default {
    data: () => {
      return {
        isActive: false,
        inputlname: "",
        appts: []

      }

    },
    mounted(){
    },

    methods: {
      submit(){
        let _this = this;
        axios.get('http://10.12.0.1:3000/appointments')
          .then(function (response) {
            // handle success
            console.log(response);
            for (let i = 0; i < response.data.length; i++) {
              let obj = response.data[i];
              console.log('looping');
              console.log(obj.LName.toLowerCase())
              if (obj.LName.toLowerCase() === _this.inputlname.toLowerCase()) {
                console.log("FName" + obj.FName);
                console.log("parsed" + Date.parse(obj.AptDateTime))
                _this.appts.push({
                  "First": obj.FName,
                  "Last": obj.LName,
                  "Time": _this.getTimeFromDate(new Date(Date.parse(obj.AptDateTime))),
                  "apt": obj.aptnum,
                  "conf": obj.confirmed
                });
                _this.isActive = true;
              }
              console.log(obj);
            }


          })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
          .finally(function () {
            // always executed
          });
      },
      confirm(aptnum){
        let _this = this;
        axios.post('http://10.12.0.1:3000/appointments/confirm/' + aptnum)
          .then(function (response) {
            // handle success
            console.log(response);
            Swal.fire(
              'Confirmed',
              'Thank you, you will be called shortly',
              'success'
            );
            _this.clearmodal();


          })
          .catch(function (error) {
            // handle error
            console.log(error);
            Swal.fire('Oops...', 'Something went wrong! Please talk to receptionist ', 'error')
          })
          .finally(function () {
            // always executed
          });
      },
      clearmodal(){
          console.log("called")
        this.appts = []
        this.inputlname = "";
        this.isActive = false;
      },
      getTimeFromDate(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        let strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
      }
    }
  }

</script>

<style>
  body {
    background-color: white;
  }
  h1{
    font-size: 5em;
  }

  .textbox {
    margin-top: 35vh;
  }
  .section{
    margin-bottom: 100vh;
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

</style>
