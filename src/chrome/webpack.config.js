var webpack = require('webpack');

module.exports = {
  devtool: false,
  entry: {
    backend: './src/backend.js',
    background: './src/background.js',
    injectGlobalHook: './src/injectGlobalHook.js',
    contentScript: './src/contentScript.js',
    panel: './src/panel.js',
    'panel-loader': './src/panel-loader.js',
    window: './src/window.js',
  },
  output: {
    path: __dirname + '/build',
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader:  'babel',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ["es2015", "stage-1"],
          plugins: ['transform-decorators-legacy', 'transform-class-properties']
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
        loader: 'style!css'
      }
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.ts'],
    alias: {
      'mobx-react': __dirname + '/../../mobx-react/src',
      'mobx': __dirname + '/../../mobx/src/mobx.ts',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      __TARGET__: JSON.stringify('browser'),
    })
  ]
};
