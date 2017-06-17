var webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  hot: false,
  output: {
    libraryTarget: 'umd',
    library: 'mobxDevtools',
    path: __dirname,
    filename: 'index.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'eslint'
      },
      {
        test: /\.css$/,
        loader: 'style!css/locals?module'
      },
      {
        test: /\.svg$/,
        loader: 'url-loader'
      },
    ]
  },
  externals: {
    'mobx-react': {
        root: 'mobxReact',
        commonjs: 'mobx-react',
        commonjs2: 'mobx-react',
        amd: 'mobx-react'
    },
    'react': {
        root: 'React',
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'react'
    },
    mobx: 'mobx'
  },
  eslint: {
    failOnWarning: false,
    failOnError: process.env.NODE_ENV !== 'development',
    fix: process.env.NODE_ENV === 'development',
    cache: false,
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      screw_ie8: true,
      compress: {
        warnings: false
      }
    })
  ]
};
