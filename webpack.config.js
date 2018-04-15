var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');
var path = require('path');

var isProd = process.env.NODE_ENV === 'production'; 
var cssDev = ['style-loader', 'css-loader', 'autoprefixer-loader', 'sass-loader'];
var cssProd = ExtractTextPlugin.extract({
  fallback: 'style-loader',
  loader: ['css-loader', 'autoprefixer-loader', 'sass-loader'],
  publicPath: ''
});
var cssConfig = isProd ? cssProd : cssDev;

module.exports = {
  entry: {
    app: './src/app.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    publicPath: ''
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        use: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: cssConfig
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,       
        use: [
          {
            loader:'babel-loader',
            query: {
              presets: ['es2015']
            }
          }
        ]
      },
      {
        test: /\.es6$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.html$/,
        use: 'html-loader'
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg)(\?\S*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'webfonts/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(jpg|png|gif|jpeg)$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    open: true,
    historyApiFallback: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Home',
      hash: true,
      template: './src/index.html'
    }),
    new ExtractTextPlugin({
      filename: 'app.css',
      disable: !isProd,
      allChunks: true
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new CopyWebpackPlugin([{from: './src/assets'}]),
  ]
};
