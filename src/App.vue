<template>
  <n-dialog-provider>
    <n-message-provider>
      <n-layout position="absolute">
        <n-layout-header bordered>
          <div class="header">
            <div class="title">
              <div class="logo">
                <router-link to="/">
                  <img src="@/assets/image/logo.png" alt="" />
                </router-link>
              </div>
              <span>TCC工具合集</span>
            </div>
          </div>
        </n-layout-header>
        <n-layout has-sider class="main">
          <n-layout-sider
            bordered
            show-trigger
            collapse-mode="width"
            :collapsed-width="8"
            :width="240"
            :native-scrollbar="false"
          >
            <n-menu :options="menuOptions" :value="currentRoute" />
          </n-layout-sider>
          <n-layout-content :style="{ padding: '10px' }" :native-scrollbar="false">
            <router-view />
          </n-layout-content>
        </n-layout>
      </n-layout>
    </n-message-provider>
  </n-dialog-provider>
</template>

<script lang="ts">
import { h, defineComponent, ref, watch } from "vue";
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NDialogProvider,
  NMessageProvider,
} from "naive-ui";
import type { MenuOption } from "naive-ui";
import { RouterLink, useRoute } from "vue-router";
import menu from "./menu";

export default defineComponent({
  components: {
    NLayout,
    NLayoutSider,
    NLayoutHeader,
    NLayoutContent,
    NDialogProvider,
    NMessageProvider,
    NMenu,
  },
  setup() {
    const menuOptions: MenuOption[] = menu.map((item) => {
      return {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                path: `/${item.path}`,
              },
            },
            { default: () => item.name }
          ),
        key: item.path,
      };
    });

    const route = useRoute();
    const currentRoute = ref("");

    watch(route, (value) => {
      currentRoute.value = value.name as string;
    });

    return {
      menuOptions,
      currentRoute,
      route,
    };
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100vw;
  height: 100vh;
}

#app::after {
  content: "";
  position: absolute;
  z-index: -99;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: url("~@/assets/image/background.png") no-repeat center center;
  filter: opacity(15%);
  background-size: cover;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.n-menu-item-content-header {
  text-align: left;
}

.n-layout,
.n-layout-header,
.n-layout-sider {
  background-color: transparent;
  border-color: black !important;
}

.n-layout-sider__border {
  background-color: black !important;
}

.header {
  height: 56px;
  display: flex;

  .title {
    display: flex;
    align-items: center;
    font-size: 32px;
    padding-left: 10px;
  }

  .logo {
    height: 50px;
    img {
      height: 50px;
    }
  }
}

.main {
  .n-layout-sider,
  .n-layout-content {
    height: calc(100vh - 57px);
  }
}
</style>
