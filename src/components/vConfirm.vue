<template>
  <div>
    <div class="modal is-active" v-show="showModal">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div v-if="loading" style="display:flex;">
          <div class="lds-circle">
            <div></div>
          </div>
        </div>
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
            <td v-if="appt.conf < 266 || appt.conf > 268"><a class="button" @click="confirm(appt.apt, appt.patid)">Check In</a>
            </td>
            <td v-else><a class="button" disabled>Checked In</a></td>
          </tr>
          </tbody>
        </table>

        <div class="has-text-centered">
          <a href="#" @click="clear()" class="button">Cancel</a>
        </div>

      </div>

    </div>
  </div>
</template>
<script>
  import EventBus from '../event-bus.js';
  import Vue from 'vue';
  import App from '../App.vue';
  import {store} from '../store';
  import axios from 'axios';
  import Swal from 'sweetalert2'
  export default {
    store,
    data: () => {
      return {
        appts: [],
        loading: false,
        showModal: false,
        ip: "",
        key: null

      }


    },
    mounted () {
//        Grab the IP if there is one in the url
        this.ip = this.getUrlVars()["ip"];
        this.key = this.getUrlVars()["key"];

      console.log(this.getUrlVars()["key"] + "Direct Key")
      console.log(this.key +" key")
//      Loop throught all of the appointments and filter them by the inputed last name
      EventBus.$on('UpdateAppts', (payload) => {
//          Start the loading animation
        this.loading = true;
        console.log("listened")
        console.log(payload + " - payload")
//        Popup the modal
        this.showModal = true;

//      Declare this pointer because inside axios this refers the the response (or something else idk what exactly this refers to in axios)
        let _this = this;
        axios.get('http://'+ this.ip + '/appointments/', {headers: {Authorization: "FCI Key " + this.key}})
          .then(function (response) {
            console.log(response);
            for (let i = 0; i < response.data.length; i++) {
              let obj = response.data[i];
              console.log('looping');
              console.log(obj.LName.toLowerCase());
              if (obj.LName.toLowerCase() === payload.toLowerCase()) {
                console.log("FName" + obj.FName);
                console.log("parsed" + Date.parse(obj.AptDateTime));
//                Push patient data to appts array
                _this.appts.push({
                  "First": obj.FName,
                  "Last": obj.LName,
                  "Time": _this.getTimeFromDate(new Date(Date.parse(obj.AptDateTime))),
                  "apt": obj.aptnum,
                  "conf": obj.confirmed,
                  "patid": obj.patnum
                });

              }

              console.log(obj);
            }
//            Make sure there is an appointment in the databse
            if (_this.appts.length < 1) {
              Swal.fire("No appointments!", "No appointments were found for the given last name. Please check your spelling and try again.", "error",);
              _this.showModal = false;
            }
//            disable loading
            _this.loading = false;


          })
          .catch(function (error) {
            Swal.fire('Oops...', 'Something went wrong! Please talk to receptionist ', 'error')
            console.log(error);
          })
          .finally(function () {
          });

      })
    },
    methods: {
//        This function confirms the appointment
      confirm(aptnum, patnum){
        this.$store.commit('setPatId', patnum)
        let _this = this;
        console.log(this.key)
        axios.post('http://'+ this.ip + '/appointments/confirm/' + aptnum, null, {headers: {Authorization: "FCI Key " + this.key}})
          .then(function (response) {
            // handle success
            console.log(response);
            let payload = patnum;
//            Triggers even for next modal for fill the update information fields (vUpdate)
            EventBus.$emit('FillInfo', payload)
            _this.showModal = false;
            _this.appts = [];


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
//      Allows for the use of the cancel button
      clear(){
        EventBus.$emit('clear')
        this.showModal = false;
      },
//      Logic to get the url vars
      getUrlVars() {
        let vars = {};
        let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
          vars[key] = value;
        });
        return vars;
      },

// Formats time into a human readable format (this is time zone specific so make sure your timezone if properley set on your device)
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
  .lds-circle {
    display: inline-block;
    transform: translateZ(1px);
    margin: auto
  }

  .lds-circle > div {
    display: inline-block;
    width: 51px;
    height: 51px;
    margin: 6px;
    border-radius: 50%;
    background: #000000;
    animation: lds-circle 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite;
  }

  @keyframes lds-circle {
    0%, 100% {
      animation-timing-function: cubic-bezier(0.5, 0, 1, 0.5);
    }
    0% {
      transform: rotateY(0deg);
    }
    50% {
      transform: rotateY(1800deg);
      animation-timing-function: cubic-bezier(0, 0.5, 0.5, 1);
    }
    100% {
      transform: rotateY(3600deg);
    }
  }

</style>



