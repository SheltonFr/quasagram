<template>
  <q-page class="constraint q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-7">
        <template v-if="!loadingPosts && posts.length">
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
              <div class="text-caption text-grey">
                {{ niceDate(post.date) }}
              </div>
            </q-card-section>
          </q-card>
        </template>

        <template v-else-if="!loadingPosts && !posts.length">
          <h5 class="text-center text-grey">
            No posts yet
          </h5>
        </template>

        <template v-else>
          <q-card flat bordered>
            <q-item>
              <q-item-section avatar>
                <q-skeleton type="QAvatar" size="40px" />
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <q-skeleton type="text" />
                </q-item-label>
                <q-item-label caption>
                  <q-skeleton type="text" />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-skeleton height="200px" square />

            <q-card-section>
              <q-skeleton type="text" class="text-subtitle2" />
              <q-skeleton type="text" width="50%" class="text-subtitle2" />
            </q-card-section>
          </q-card>
        </template>
      </div>
      <div class="col-5 large-screen-only">
        <q-item class="fixed">
          <q-item-section avatar>
            <q-avatar size="48px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>sheltonfr</q-item-label>
            <q-item-label caption>Teste </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { date } from "quasar";

export default defineComponent({
  name: "PageHome",

  data() {
    return {
      posts: [],
      loadingPosts: true,
    };
  },

  methods: {
    niceDate(value) {
      return date.formatDate(value, "YYYY MMMM Do HH:mma");
    },

    getPosts() {
      // this.$axios.get("https://quasagram-backend.onrender.com/posts")
      // .then(result => this.posts = result.data)
      // .catch(error => console.log(error))

      this.$axios
        .get("https://quasagram-backend.onrender.com/posts")
        .then((result) => {
          this.posts = result.data;
          this.loadingPosts = false;

        })
        .catch((error) => {
          this.$q.dialog({
            title: "Error",
            message: "An error occurred while readning posts from server!",
          });

          this.loadingPosts = false;
        });

    },
  },

  mounted() {
    this.getPosts();
  },
});
</script>

<style lang="sass">
.my-post
  .q-img__image
    min-inline-size: 200px
</style>
