module.exports = {
  devServer: {
    // Fixing issue with WDS disconnected and sockjs network error
    host: '0.0.0.0',
    liveReload: true,
    // End of fix
  },
  configureWebpack: {
    resolve: {
      fallback: {
        querystring: require.resolve("querystring-es3"),
        zlib: require.resolve("browserify-zlib"),
        "assert": require.resolve("assert/"),
        "util": require.resolve("util/"),
        "stream": require.resolve("stream-browserify")
      },
    },
  },
  runtimeCompiler: true,
  chainWebpack: config => {
    config.module.rules.delete("svg");
    config.module.rules.delete("images");
    config.module
      .rule("file-loader")
      .test(/\.(png|jpe?g|gif|gltf|svg)$/i)
      .use("file-loader")
      .loader("file-loader")
      .tap(options => {
        if (!options) {
          options = {};
        }
        options.esModule = false;
        return options;
      })
      .end();
  },
};
