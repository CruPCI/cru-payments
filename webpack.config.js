const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  // tsconfig targets es5; webpack 5 emits es2015 runtime code by default,
  // so pin es5 to keep the bundles as browser-compatible as the webpack 4 output
  target: ['web', 'es5'],
  entry: {
    'cru-payments': './src/index.ts',
    'cru-payments-ba': './src/bank-account/bank-account.ts',
    'cru-payments-cc': './src/credit-card/credit-card.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'cruPayments',
      type: 'umd'
    },
    // webpack 4 used `window` as the UMD global object; keep it so the
    // published artifacts remain drop-in identical for browser consumers
    globalObject: 'window'
  },
  module: {
    rules: [
      // all files with a `.ts` extension but not `.spec.ts` will be handled by `ts-loader`
      { test: /^(?!.*\.spec\.ts$).*\.ts$/, loader: 'ts-loader' }
    ]
  },
  devtool: "source-map",
  optimization: {
    // webpack 4 kept license comments inline; don't emit *.LICENSE.txt files
    // so the set of published dist files stays the same
    minimizer: [new TerserPlugin({ extractComments: false })]
  },
  devServer: {
    port: 3000, // Whitelisted for TSYS staging
    hot: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};
