<template>
  <h1>本页面是TCC工具合集，目前有以下功能</h1>
  <div>
    <router-link v-for="(item, index) in menu" :to="`/${item.path}`">{{ item.name }}</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import menu from "@/menu";

export default defineComponent({
  name: "Home",
  setup() {
    return { menu };
  },
});
</script>

<style lang="scss" scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #18a058;
  font-size: 18px;
}
</style>
