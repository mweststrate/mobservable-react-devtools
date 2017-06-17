var webpack = require('webpack');

module.exports = {
  devtool: false,
  entry: {
    backend: './src/chrome/src/backend.js',
    background: './src/chrome/src/background.js',
    injectGlobalHook: './src/chrome/src/injectGlobalHook.js',
    contentScript: './src/chrome/src/contentScript.js',
    panel: './src/chrome/src/panel',
    'panel-loader': './src/chrome/src/panel-loader.js',
    window: './src/chrome/src/window',
  },
  output: {
    path: __dirname + '/src/chrome/build',
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader:  'babel-loader',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ["es2015", "stage-1"],
          plugins: ['transform-decorators-legacy', 'transform-class-properties']
        }
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        query: {
          failOnWarning: false,
          failOnError: process.env.NODE_ENV !== 'development',
          fix: process.env.NODE_ENV === 'development',
          cache: false,
        }
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.svg$/,
        loader: 'url-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!style-loader'
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts'],
    alias: {
      'mobx-react': __dirname + '/mobx-react/src',
      'mobx': __dirname + '/mobx/src/mobx.ts',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      __TARGET__: JSON.stringify('browser'),
    })
  ]
};
