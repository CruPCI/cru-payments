const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

module.exports = (env = {}) => ({
  entry: {
    'cru-payments': './src/index.ts',
    'cru-payments-ba': './src/bank-account/bank-account.ts',
    'cru-payments-cc': './src/credit-card/credit-card.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: 'cruPayments',
    libraryTarget: 'umd',
  },
  plugins: env.analyze ? [new BundleAnalyzerPlugin()] : [],
  module: {
    rules: [
      // all files with a `.ts` extension but not `.spec.ts` will be handled by `ts-loader`
      { test: /^(?!.*\.spec\.ts$).*\.ts$/, loader: 'ts-loader' },
    ],
  },
  devtool: 'source-map',
  devServer: {
    inline: true,
    port: 3000, // Whitelisted for TSYS staging
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
});
