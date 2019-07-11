<template>
  <div>
    <div class="modal is-active" v-show="showModal">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="container is-center has-text-center">

          <h1>Update Info</h1>

          <img style="position: absolute;top: 0px;right: 0px;" width="100px" v-if="this.patnum != 0" :src="imgSrc" alt="">

          <div class="columns">
            <div class="column is-one-third">
              <label>Preferred Contact Method</label>
              <div class="field">
                <div class="control">

                  <div class="select is-info">
                    <select v-model="currentPat.PreferContactMethod">
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
                    <select v-model="currentPat.PreferConfirmMethod">
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
                    <select v-model="currentPat.PreferRecallMethod">
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
              <input placeholder="(226)555-5555" v-model="currentPat.WirelessPhone" type="text" class="input">
              <label>Work Phone</label>
              <input placeholder="(226)555-5555" v-model="currentPat.WkPhone" type="text" class="input">
              <label>Home Phone</label>
              <input placeholder="(226)555-5555" v-model="currentPat.HmPhone" type="text" class="input">
              <label>Email</label>
              <input type="text" class="input" v-model="currentPat.Email">
              <div class="has-text-centered">
                <p>If you need to change your address please see the receptionist </p>
                <i>
                  <p>{{currentPat.Address}}</p>
                </i>
                <br>
                <i>
                  <p>{{currentPat.Address2}}</p>
                </i>
              </div>
            </div>
          </div>
        </div>
        <div class="has-text-centered">
          <a href="#" class="button" style="margin-top: 15px;" @click="updateInfo">Update Info</a>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import EventBus from '../event-bus.js';
  import {store} from '../store';
  import axios from 'axios';
  import Swal from 'sweetalert2'
  export default {
    store,
    props: {},
    data: () => {
      return {
        showModal: false,
        disableCamera: false,
        contactOptions: [{text: "None", value: 0}, {text: "Do not call", value: 1},
          {text: "Home Phone", value: 2},
          {text: "Work Phone", value: 3},
          {text: "Wireless Phone", value: 4},
          {text: "Email", value: 5},
          {text: "Custom", value: 6},
          {text: "Mail", value: 7},
          {text: "Text", value: 8}],
        disallowedMethods: [6,7,1],
        defaultMethods:[],
        ip: "10.12.0.1:3000",
        key: "",
        currentPat: {},

        patnum: 0,
      }

    },
    computed: {
      getPatId(){
        return this.$store.getters.getPatId
      },
      imgSrc: function(){
        return 'http://' + this.ip + '/patients/' + this.patnum + '/photo?auth=' + this.key + "&rand=" + Math.random()
      }
    },
    //Populate Modal With Data
    mounted () {
// Get the ip from url

        this.ip = this.getUrlVars()["ip"];
        this.key = this.getUrlVars()["key"];
        this.disableCamera = (this.getUrlVars()["disablecam"] === "true#") || (this.getUrlVars()['disablecam'] === "true");

      EventBus.$on('clear', () => {
        this.patnum = 0;
        this.showModal = false;
        this.currentPat = {};
        this.defaultMethods = [];
      });

      EventBus.$on('FillInfo', (payload) => {
        this.showModal = true;
        this.patnum = payload;

        let _this = this;
        //        Grab patient information for them to update and put into a json array and local vars to compare what they changed later
        axios.get('http://'+ this.ip + '/patients/' + this.patnum, {headers: {Authorization: "FCI Key " + this.key}})
          .then(function (response) {
            console.log(response + "updateFill")
            _this.currentPat = response.data;
            _this.defaultMethods = [
              response.data.PreferConfirmMethod,
              response.data.PreferRecallMethod,
              response.data.PreferContactMethod
            ]
          })
          .catch(function (error) {
            Swal.fire('Oops...', 'Something went wrong! Please talk to receptionist ', 'error')
          });
      });
    },

    methods: {
        openCamera(){
          EventBus.$emit('openCamera', this.patnum)
          console.log("open camera emitted")
        },
      updateInfo(){
          console.log(this.currentPat.PreferConfirmMethod);
//          Checks some requirements to make sure new information is valid
        let phoneReg = /^[\\(]{0,1}([0-9]){3}[\\)]{0,1}[ ]?([^0-1]){1}([0-9]){2}[ ]?[-]?[ ]?([0-9]){4}[ ]*((x){0,1}([0-9]){1,5}){0,1}$/
        if (!this.currentPat.WirelessPhone.match(phoneReg) && !this.currentPat.WkPhone.match(phoneReg) && !this.currentPat.HmPhone.match(phoneReg)) {
          Swal.fire('Oops...', 'Invalid or No phone number (format is (xxx)xxx-xxxx', 'error');
          return
        }
        if(this.disallowedMethods.includes(this.currentPat.PreferConfirmMethod) && this.defaultMethods[0] !== this.currentPat.PreferConfirmMethod){
          Swal.fire('Oops...', 'You can not use that as a Confirmation Contact Method', 'error');
          return
        }
        if(this.disallowedMethods.includes(this.currentPat.PreferRecallMethod) && this.defaultMethods[1] !== this.currentPat.PreferRecallMethod){
          Swal.fire('Oops...', 'You can not use that as a Recall Contact Method', 'error');
          return
        }
        if(this.disallowedMethods.includes(this.currentPat.PreferContactMethod) && this.defaultMethods[2] !== this.currentPat.PreferContactMethod){
          Swal.fire('Oops...', 'You can not use that as a Default Contact Method', 'error');
          return
        }
        let _this = this;
//        Put request to update the patient information
        axios.put('http://'+ this.ip + '/patients/' + this.patnum, this.currentPat, {headers: {Authorization: "FCI Key " + this.key}})
          .then(function (response) {

            if(_this.disableCamera){
              Swal.fire(
                'Confirmed',
                'Thank you, you will be called shortly',
                'success'
              ).then(EventBus.$emit('clear'))
            } else {
              _this.showModal = false;
              _this.openCamera();
            }
          })
          .catch(function (error) {
            Swal.fire('Oops...', 'Something went wrong! Please talk to receptionist 1', 'error').then(()=>{
              EventBus.$emit('clear');
            });

          });
      },
      getUrlVars() {
        let vars = {};
        let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
          vars[key] = value;
        });
        return vars;
      },
    },
  }


</script>
