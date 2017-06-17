var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    './mobx-react-todomvc/src/client'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      'mobx-react-devtools': __dirname + '/src',
      'mobx-react': __dirname + '/mobx-react/src',
      'mobx': __dirname + '/mobx/src/mobx.ts',
    },
  },
  externals: {
    'react-native': {
      root: 'ReactNative',
      commonjs: 'react-native',
      commonjs2: 'react-native',
      amd: 'react-native'
    },
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
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.svg$/,
        loader: 'url-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __TARGET__: JSON.stringify('browser'),
      __CLIENT__: JSON.stringify(true),
      __SERVER__: JSON.stringify(false),
    })
  ]
};
