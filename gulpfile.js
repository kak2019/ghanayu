'use strict';

const build = require('@microsoft/sp-build-web');
const { merge } = require('webpack-merge');
const { VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack');

build.sass.setConfig({
  sassMatch: []
});

build.configureWebpack.mergeConfig({
  additionalConfiguration: function (config) {
    config.plugins.push(new VueLoaderPlugin());

    var vueConfig = {
      devtool: process.env.NODE_ENV === 'development' ? 'source-map' : undefined,
      plugins: [
        new webpack.DefinePlugin({
          __VUE_OPTIONS_API__: 'true',
          __VUE_PROD_DEVTOOLS__: 'false',
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
        })
      ],
      // resolve: {
      //   extensions: ['.ts', '.vue']
      // },
      module: {
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader'

          },
          {
            test: /\.scss$/,
            use: [
              'vue-style-loader',
              'css-loader',
            ]
          },
          {
            test: /\.mjs$/,
            include: /node_modules/,
            type: "javascript/auto"
          }
        ],
      }
    };

    return merge(config, vueConfig);
  }
});

let copyOtherFiles = build.subTask('copy-other-files', function (gulp, buildOptions, done) {
  return gulp.src(['src/**/*.vue', 'src/**/*.scss'])
    .pipe(gulp.dest(buildOptions.libFolder))
});
build.task('copy-other-files', copyOtherFiles);

build.rig.addPostTypescriptTask(copyOtherFiles);
build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

/* fast-serve */
const { addFastServe } = require("spfx-fast-serve-helpers");
addFastServe(build);
/* end of fast-serve */

build.initialize(require('gulp'));

