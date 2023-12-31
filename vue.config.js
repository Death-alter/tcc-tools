/* eslint-disable */
"use strict";

const path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  publicPath: "/",
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: false,
  productionSourceMap: false,
  // webpack-dev-server 相关配置
  devServer: {
    host: "0.0.0.0",
    port: "8888",
    open: true,
    // proxy: {
    //   [process.env.VUE_APP_BASE_API]: {
    //     target: `http://`,
    //     changeOrigin: true,
    //     pathRewrite: {
    //       ["^" + process.env.VUE_APP_BASE_API]: "",
    //     },
    //   },
    // },
  },
  configureWebpack: {
    name: "tcc-tools",
    resolve: {
      alias: {
        "@": resolve("src"),
        components: "@/components",
      },
    },
  },
};
