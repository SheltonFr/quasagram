<template>
  <q-page class="constraint-more q-pa-md">
    <div class="camera-frame q-pa-md">
      <video
        v-show="!imageCaptured"
        ref="video"
        class="full-width"
        autoplay
        playsinline
      />
      <!--
        playsinline -  activa o autoplay para ios
        ref - fornece uma referencia para acessar o elemento na seccao de scripts
      -->
      <canvas v-show="imageCaptured" ref="canvas" class="full-width" />
    </div>

    <div class="text-center q-pa-md">
      <q-btn
        v-if="hasCameraSupport"
        round
        size="lg"
        color="grey-10"
        @click="captureImage"
        :disable="imageCaptured"
        icon="eva-camera"
      />

      <q-file
        dense
        @input="captureImageFallback"
        v-else
        accept="image/*"
        outlined
        label="Choose an image"
        v-model="imageUpload"
      >
        <template v-slot:prepend>
          <q-icon name="eva-attach-outline" />
        </template>
      </q-file>

      <div class="row justify-center q-ma-md">
        <q-input
          dense
          class="col col-sm-8"
          v-model="post.caption"
          label="Caption*"
        />
      </div>

      <div class="row justify-center q-ma-md">
        <q-input
          dense
          :loading="locationLoading"
          class="col col-sm-8"
          v-model="post.location"
          label="Location"
        >
          <template v-slot:append>
            <q-btn
              v-if="!locationLoading && locationSupported"
              @click="getLocation"
              round
              dense
              flat
              icon="eva-navigation-2-outline"
            />
          </template>
        </q-input>
      </div>

      <div class="row justify-center q-mt-lg">
        <q-btn
          unelevated
          @click="addPost"
          :disable="!post.caption || !post.photo"
          rounded
          color="primary"
          label="Post Image"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { uid } from "quasar";
import "md-gum-polyfill";
import axios from "axios";

export default defineComponent({
  name: "PageCamera",

  data() {
    return {
      post: {
        id: uid(),
        caption: "",
        location: "",
        photo: null,
        date: Date.now(),
      },

      imageCaptured: false,
      hasCameraSupport: true,
      imageUpload: [],
      locationLoading: false,
    };
  },

  methods: {
    initCamera() {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then((stream) => {
          this.$refs.video.srcObject = stream;
        })
        .catch((error) => (this.hasCameraSupport = false));
    },

    captureImage() {
      let video = this.$refs.video;
      let canvas = this.$refs.canvas;

      canvas.width = video.getBoundingClientRect().width;
      canvas.height = video.getBoundingClientRect().height;
      let context = canvas.getContext("2d");

      // desenhando a imagem no canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.imageCaptured = true;
      this.post.photo = this.dataURItoBlob(canvas.toDataURL());
      this.disableCamera();
    },

    captureImageFallback(file) {
      this.post.photo = file;

      let canvas = this.$refs.canvas;
      let context = canvas.getContext("2d");

      var reader = new FileReader();
      reader.onload = (event) => {
        var img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
          this.imageCaptured = true;
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    },

    disableCamera() {
      this.$refs.video.srcObject.getVideoTracks().forEach((track) => {
        track.stop();
      });
    },

    dataURItoBlob(dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      var byteString = atob(dataURI.split(",")[1]);

      // separate out the mime component
      var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);

      // create a view into the buffer
      var ia = new Uint8Array(ab);

      // set the bytes of the buffer to the correct values
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      var blob = new Blob([ab], { type: mimeString });
      return blob;
    },

    getCityAndCountry(position) {
      let apiUrl = `https://geocode.xyz/${position.coords.latitude},${position.coords.longitude}?json=1&auth=150228645591201546480x55866`;

      axios
        .get(apiUrl)
        .then((result) => this.locationSuccess(result.data))
        .catch((error) => this.locationError());
    },

    locationSuccess(locationData) {
      this.post.location = locationData.city;

      if (locationData.country) {
        this.post.location += `, ${locationData.country}`;
      }
      this.locationLoading = false;
    },

    locationError() {
      this.$q.dialog({
        title: "Error",
        message: "Could not found your location!",
      });
      this.locationLoading = false;
    },

    getLocation() {
      this.locationLoading = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.getCityAndCountry(position);
        },
        (error) => this.locationError(),
        { timeout: 7000 }
      );
    },

    addPost() {
      this.$q.loading.show();

      let formData = new FormData();
      formData.append("id", this.post.id);
      formData.append("caption", this.post.caption);
      formData.append("date", this.post.date);
      formData.append("location", this.post.location);
      formData.append("file", this.post.photo, this.post.id + ".png");

      this.$axios
        .post(`${process.env.API}/createPost`, formData)
        .then((response) => {
          this.$router.push("/");

          this.$q.notify({
            message: "Post created!",
            actions: [{ label: "Dismiss", color: "white" }],
          });

          this.$q.loading.hide();
        })
        .catch((err) => {
          this.$q.dialog({
            title: "Error",
            message: "Sorry, could not create post!!",
          });
          this.$q.loading.hide();
        });
    },
  },

  computed: {
    locationSupported() {
      if ("geolocation" in navigator) return true;
      return false;
    },
  },

  mounted() {
    // Inicializar a camera quando a tela for chamada
    this.initCamera();
    console.log(navigator);
  },

  beforeUnmount() {
    if (this.hasCameraSupport) {
      this.disableCamera();
    }
  },
});
</script>

<style lang="sass">
.camera-frame
  border: 2px solid $grey-10
  border-radius: 10px
</style>
