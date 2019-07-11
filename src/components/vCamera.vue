<template>
  <div class="modal is-active" v-show="showModal">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="columns">


        <div class="column">
          <h2>Current Camera</h2>
          <code v-if="device">{{ device.label }}</code>
          <div class="border">
            <vue-web-cam ref="webcam"
                         :device-id="deviceId"
                         width="25%"
                         @started="onStarted"
                         @stopped="onStopped"
                         @error="onError"
                         @cameras="onCameras"
                         @camera-change="onCameraChange"/>
          </div>
          <div class="buttons">
            <button type="button"
                    class="button"
                    @click="onCapture">Capture Photo
            </button>
            <button type="button"
                    class="button"
                    @click="cancelWebcam">Skip
            </button>
          </div>
        </div>
        <div class="col-md-6">
          <h2 style="right: 521px; position: absolute;">Captured Image</h2>
          <figure class="figure webcamimg">
            <img :src="img" class="">
            <a v-if="img != null" href="#" @click="uploadPhoto" class="button">
              Set as Profile Photo
            </a>
          </figure>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {WebCam} from "vue-web-cam";
  import EventBus from '../event-bus.js';
  import Vue from 'vue';
  import App from '../App.vue';
  import {store} from '../store';
  import axios from 'axios';
  import Swal from 'sweetalert2'
  export default {
    name: "App",
    components: {
      "vue-web-cam": WebCam
    },
    data() {
      return {
        img: null,
        camera: null,
        deviceId: null,
        patnum: 0,
        showModal: false,
        ip: null,
        key: null,
        devices: []
      };
    },
    computed: {
      device: function () {
        return this.devices.find(n => n.deviceId === this.deviceId);
      }
    },
    created(){
      this.selectCamera()
    },
    watch: {
      camera: function (id) {
        this.deviceId = id;
      },
      devices: function () {
        // Once we have a list select the first one
        const [first, ...tail] = this.devices;
//        if (first) {
//          this.camera = first.deviceId;
//          this.deviceId = first.deviceId;
//        }
      }
    },
    mounted (){
      EventBus.$on('clear', (payload) => {
        this.patnum = 0;
        this.showModal = false;
        this.img = null;
      });
      EventBus.$on('openCamera', (payload) => {

        this.ip = this.getUrlVars()["ip"];
        this.key = this.getUrlVars()["key"];
        this.patnum = payload;
        this.showModal = true;
        this.selectCamera()
      });

    },

    methods: {
      selectCamera(){
        this.onStart()
        try {
          this.deviceId = this.devices[this.getUrlVars()["camid"]].deviceId
        } catch (e) {
          console.warn("there was an error fetching device id (but its ok it still works for some reason)")
        }

        this.camera = this.deviceId
      },
      onCapture() {
        this.img = this.$refs.webcam.capture();
      },
      onStarted(stream) {
        console.log("On Started Event", stream);
      },
      cancelWebcam(){
        Swal.fire(
          'Confirmed',
          'Thank you, you will be called shortly',
          'success'
        ).then(EventBus.$emit('clear'))
      },
      onStopped(stream) {
        console.log("On Stopped Event", stream);
      },
      onStop() {
        this.$refs.webcam.stop();
      },
      onStart() {
        try {
          this.$refs.webcam.start();
        } catch (e) {
          console.warn("there was an error fetching webcam start (but its ok it still works for some reason)")
        }

      },
      onError(error) {
        console.log("On Error Event", error);
      },
      onCameras(cameras) {
        this.devices = cameras;
        console.log("On Cameras Event", cameras);
      },
      onCameraChange(deviceId) {
        this.deviceId = deviceId;
        this.camera = deviceId;
        console.log("On Camera Change Event", deviceId);
      },
      getUrlVars() {
        let vars = {};
        let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
          vars[key] = value;
        });
        return vars;
      },
      uploadPhoto(){
        console.log(this.img)
        let _this = this;
        axios.post('http://' + this.ip + '/patients/' + this.patnum + "/photo", {
          photo: _this.img,

        }, {headers: {Authorization: "FCI Key " + this.key}})
          .then(function (response) {
            console.log(response)
            Swal.fire(
              'Confirmed',
              'Thank you, you will be called shortly',
              'success'
            ).then(EventBus.$emit('clear'))
//            Clear all data for next user


          })
          .catch(function (error) {
            console.log(error)
            Swal.fire('Oops...', 'Something went wrong! Please talk to receptionist', 'error')
            EventBus.$emit('clear')

          })
          .finally(function () {

          });
      }
    }
  };
</script>
<style scoped>
  .webcamimg {
    position: absolute;
    top: 126px;
    right: 400px;
    width: 24%;
  }
</style>
