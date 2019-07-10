<template>
  <div>
    <div class="modal is-active" v-show="showModal">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="container is-center has-text-center">

          <h1>Update Info</h1>

          <div class="columns">
            <div class="column is-one-third">
              <label>Preferred Contact Method</label>
              <div class="field">
                <div class="control">

                  <div class="select is-info">
                    <select v-model="contactSelected">
                      <option v-for="option in contactOptions" v-bind:value="option.value">
                        {{ option.text }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="column is-one-third">
              <label>Preferred Confirm Method</label>
              <div class="field">
                <div class="control">
                  <div class="select is-info">
                    <select v-model="confirmSelected">
                      <option v-for="option in contactOptions" v-bind:value="option.value">
                        {{ option.text }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="column is-one-third">
              <label>Preferred Recall Method</label>
              <div class="field">
                <div class="control">
                  <div class="select is-info">
                    <select v-model="recallSelected">
                      <option v-for="option in contactOptions" v-bind:value="option.value">
                        {{ option.text }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="field">
            <div class="control">
              <label>Cell Phone</label>
              <input placeholder="(226)555-5555" v-model="cell" type="text" class="input">
              <label>Work Phone</label>
              <input placeholder="(226)555-5555" v-model="work" type="text" class="input">
              <label>Home Phone</label>
              <input placeholder="(226)555-5555" v-model="home" type="text" class="input">
              <label>Email</label>
              <input type="text" class="input" v-model="email">
              <div class="has-text-centered">
                <p>If you need to change your address please see the receptionist </p>
                <i>
                  <h1>{{address}}</h1>
                </i>

                <br>
                <i>
                  <h1>{{address2}}</h1>
                </i>
              </div>
            </div>
          </div>
        </div>
        <div class="has-text-centered">
          <a href="#" class="button" @click="openCamera">Update Profile Picture</a>
          <a href="#" class="button" style="margin-top: 15px;" @click="updateInfo">Update Info</a>
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
    props: {},
    data: () => {
      return {
        showModal: false,

        contactOptions: [{text: "None", value: 0}, {text: "Do not call", value: 1},
          {text: "Home Phone", value: 2},
          {text: "Work Phone", value: 3},
          {text: "Wireless Phone", value: 4},
          {text: "Email", value: 5},
          {text: "Custom", value: 6},
          {text: "Mail", value: 7},
          {text: "Text", value: 8}],

        contactSelected: 3,
        confirmSelected: 3,
        recallSelected: 3,

        home: "",
        work: "",
        cell: "",
        email: "",
        address: "",
        address2: "",

        ip: "10.12.0.1:3000",
        key: "",

        currentPat: [],

        patnum: 0,
      }

    },
    computed: {
      getPatId(){
        return this.$store.getters.getPatId
      }
    },
    //Populate Modal With Data
    mounted () {
// Get the ip from url
      if (!this.getUrlVars()["ip"] === undefined) {
        this.ip = this.getUrlVars()["ip"];
      }
        this.key = this.getUrlVars()["key"];

      console.log(this.ip)
      console.log(this.key + "update Key")
      EventBus.$on('FillInfo', (payload) => {
        this.showModal = true;
        this.patnum = payload;

        let _this = this;
console.log(this.key + "superdooper")
//        Grab patient information for them to update and put into a json array and local vars to compare what they changed later
        axios.get('http://'+ this.ip + '/patients/' + this.patnum, {headers: {Authorization: "FCI Key " + this.key}})
          .then(function (response) {
            console.log(response + "updateFill")
            _this.currentPat.push({
              "PreferConfirmMethod": response.data[0].PreferConfirmMethod,
              "PreferContactMethod": response.data[0].PreferContactMethod,
              "PreferRecallMethod": response.data[0].PreferRecallMethod,
              "WirelessPhone": response.data[0].WirelessPhone,
              "WkPhone": response.data[0].WkPhone,
              "HmPhone": response.data[0].HmPhone,
              "Email": response.data[0].Email,
              "Address": response.data[0].Address,
              "Address2": response.data[0].Address2,
            });
            console.log("We Have Gotten Here")
            _this.confirmSelected = _this.currentPat[0].PreferConfirmMethod;
            _this.recallSelected = _this.currentPat[0].PreferRecallMethod;
            _this.contactSelected = _this.currentPat[0].PreferContactMethod;
            _this.cell = _this.currentPat[0].WirelessPhone;
            _this.home = _this.currentPat[0].HmPhone;
            _this.work = _this.currentPat[0].WkPhone;
            _this.email = _this.currentPat[0].Email;
            _this.address = _this.currentPat[0].Address;
            _this.address2 = _this.currentPat[0].Address2;
          })
          .catch(function (error) {
            Swal.fire('Oops...', 'Something went wrong! Please talk to receptionist ', 'error')
            return;
          })
          .finally(function () {

          });
      });
    },

    methods: {
        openCamera(){
          EventBus.$emit('openCamera', this.patnum)
          console.log("open camera emitted")
        },
      updateInfo(){
//          Checks some requirements to make sure new information is valid
        let phoneReg = /^[\\(]{0,1}([0-9]){3}[\\)]{0,1}[ ]?([^0-1]){1}([0-9]){2}[ ]?[-]?[ ]?([0-9]){4}[ ]*((x){0,1}([0-9]){1,5}){0,1}$/
        if (!this.cell.match(phoneReg) && !this.work.match(phoneReg) && !this.home.match(phoneReg)) {
          Swal.fire('Oops...', 'Invalid or No phone number (format is (xxx)xxx-xxxx', 'error')
          return
        }
        if ((this.confirmSelected === 6 || this.confirmSelected === 7 || this.confirmSelected === 1) && !(this.currentPat[0].PreferConfirmMethod === 6 || this.currentPat[0].PreferConfirmMethod === 7 || this.currentPat[0].PreferConfirmMethod === 1)) {
          Swal.fire('Oops...', 'You can not use that as a Confirm Contact Method', 'error')
          return
        }
        if ((this.recallSelected === 6 || this.recallSelected === 7 || this.recallSelected === 1) && !(this.currentPat[0].PreferRecallMethod === 6 || this.currentPat[0].PreferRecallMethod === 7 || this.currentPat[0].PreferRecallMethod === 1)) {
          Swal.fire('Oops...', 'You can not use that as a Recall Contact Method', 'error')
          return
        }
        if ((this.contactSelected === 6 || this.contactSelected === 7 || this.contactSelected === 1) && !(this.currentPat[0].PreferContactMethod === 6 || this.currentPat[0].PreferContactMethod === 7 || this.currentPat[0].PreferContactMethod === 1)) {
          Swal.fire('Oops...', 'You can not use that as a Contact Method', 'error')
          return
        }
        this.showModal = false;
        let _this = this;
//        Put request to update the patient information
        axios.put('http://'+ this.ip + '/patients/' + _this.patnum, {
          PreferConfirmMethod: _this.confirmSelected,
          PreferRecallMethod: _this.recallSelected,
          PreferContactMethod: _this.contactSelected,
          WirelessPhone: _this.cell,
          HmPhone: _this.home,
          WkPhone: _this.work,
          Email: _this.email

        }, {headers: {Authorization: "FCI Key " + this.key}})
          .then(function (response) {
            console.log(response)
            console.log(_this.patnum)
            _this.showModal = false;
            _this.$store.commit('setPatId', 0)
            Swal.fire(
              'Confirmed',
              'Thank you, you will be called shortly',
              'success'
            );
//            Clear all data for next user
            EventBus.$emit('clear')
          })
          .catch(function (error) {
            Swal.fire('Oops...', 'Something went wrong! Please talk to receptionist 1', 'error')
            EventBus.$emit('clear')

          })
          .finally(function () {

          });

      },
      getUrlVars() {
        let vars = {};
        let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
          vars[key] = value;
        });
        return vars;
      },
    }
  }


</script>
