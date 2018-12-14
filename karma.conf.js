const path = require('path');
const webpackConfig = require('./webpack.config.js')();

delete webpackConfig.entry;
delete webpackConfig.plugins;
delete webpackConfig.devServer;
webpackConfig.devtool = 'inline-source-map';
webpackConfig.module.rules.push({
  test: /^(?!.*\.(spec|fixture)\.js$).*\.js$/,
  include: path.resolve('src/'),
  loader: 'istanbul-instrumenter-loader',
  query: {
    esModules: true,
  },
});

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome-customReferrer'],
    customLaunchers: {
      'Chrome-customReferrer': {
        base: 'Chrome',
        options: {
          customHeaders: {
            Referer:
              'https://sites-stage.familylife.com/fldonate/' ||
              process.env.TSYS_REFERRER,
          },
        },
      },
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage-istanbul'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // list of files / patterns to load in the browser

    files: [{ pattern: 'src/all-tests.spec.js', watched: false }],

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/all-tests.spec.js': ['webpack', 'sourcemap'],
    },

    webpack: webpackConfig,

    coverageIstanbulReporter: {
      reports: ['lcov'],
      fixWebpackSourcePaths: true,
    },
  });
};
