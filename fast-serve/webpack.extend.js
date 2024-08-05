/*
* User webpack settings file. You can add your own settings here.
* Changes from this file will be merged into the base webpack configuration file.
* This file will not be overwritten by the subsequent spfx-fast-serve calls.
*/
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
/**
 * you can add your project related webpack configuration here, it will be merged using webpack-merge module
 * i.e. plugins: [new webpack.Plugin()]
 */
const webpackConfig = {
  devtool: 'source-map',//align with gulpfile, but it seems does not work in fast serve and chrome, try edge or back to gulp serve if you use it.
  plugins: [new VueLoaderPlugin(),
  new webpack.DefinePlugin({
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
  })
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'

      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      }
    ],
  }
}

/**
 * For even more fine-grained control, you can apply custom webpack settings using below function
 * @param {object} initialWebpackConfig - initial webpack config object
 * @param {object} webpack - webpack object, used by SPFx pipeline
 * @returns webpack config object
 */
const transformConfig = function (initialWebpackConfig, webpack) {
  // transform the initial webpack config here, i.e.
  // initialWebpackConfig.plugins.push(new webpack.Plugin()); etc.
  return initialWebpackConfig;
}

module.exports = {
  webpackConfig,
  transformConfig
}
