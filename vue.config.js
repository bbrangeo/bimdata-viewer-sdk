module.exports = {
configureWebpack: {
    resolve: {
      fallback: { "querystring": require.resolve("querystring-es3") }
    }
  },
  runtimeCompiler: true,
  chainWebpack: config => {
    config.module.rules.delete('svg');
    config.module.rules.delete('images');
    config.module.rule('file-loader')
      .test( /\.(png|jpe?g|gif|gltf|svg)$/i)
      .use('file-loader')
      .loader('file-loader')
      .tap(options => {
        if(!options) {
          options = {};
        }
        options.esModule = false;
        return options
      })
      .end();
  }
}
