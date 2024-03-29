// Karma configuration

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'karma-typescript'],

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS-customReferrer'],
    customLaunchers: {
      'PhantomJS-customReferrer': {
        base: 'PhantomJS',
        options: {
          customHeaders: { Referer: process.env.TSYS_REFERRER }
        }
      }
    },
    
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', "karma-typescript"],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // list of files / patterns to load in the browser

    files: [
      'src/**/*.ts'
    ],
    exclude: ["src/payment-providers/declarations.d.ts"],

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "**/*.ts": ["karma-typescript"]
    },

    karmaTypescriptConfig: {
      bundlerOptions: {
        transforms: [
            require("karma-typescript-es6-transform")()
        ]
      },
      reports: {
        'html': 'coverage',
        'lcovonly': {
          "directory": "coverage",
          "filename": "lcov.info"
        }
      }
    }
  });
};
