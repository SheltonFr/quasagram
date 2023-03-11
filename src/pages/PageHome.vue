<template>
  <q-page class="constraint q-pa-md">
    <q-card
      v-for="post in posts"
      :key="post.id"
      class="my-post q-mb-md"
      flat
      bordered
    >
      <q-item>
        <q-item-section avatar>
          <q-avatar>
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>sheltonfr</q-item-label>
          <q-item-label caption> {{ post.location }} </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />
      <q-img :src="post.imageUrl" />
      <q-card-section>
        <div class="">{{ post.caption }}}</div>
        <div class="text-caption text-grey">{{niceDate(post.date)}}</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { date } from "quasar";

export default defineComponent({
  name: "PageHome",

  data() {
    return {
      posts: [
        {
          id: 1,
          caption: "Golden Gate Bridge",
          date: 1678541530377,
          location: "South Beach",
          imageUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
        },
        {
          id: 2,
          caption: "Golden Gate Bridge",
          date: 1678541530377,
          location: "South Beach",
          imageUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
        },
        {
          id: 3,
          caption: "Golden Gate Bridge",
          date: 1678541530377,
          location: "South Beach",
          imageUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
        },
        {
          id: 4,
          caption: "Golden Gate Bridge",
          date: 1678541530377,
          location: "South Beach",
          imageUrl: "https://cdn.quasar.dev/img/parallax2.jpg",
        },
      ],
    };
  },

  methods: {
    niceDate(value) {
      return date.formatDate(value, 'YYYY MMMM Do HH:mma');
    },
  },
});
</script>

<style lang="sass">
.my-post
  .q-img__image
    min-inline-size: 200px
</style>
