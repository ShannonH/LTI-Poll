const path = require("path");
const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  optimization: {
    minimizer: [new UglifyJsPlugin({parallel: true})],
    removeAvailableModules: true,
    removeEmptyChunks: true,
    mergeDuplicateChunks: true,
    usedExports: true,
    splitChunks: {
      chunks: 'async',
      minChunks: 1,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      },
      minSize: 30000,
      maxSize: 0,
    },
  },
  entry: "./public/src/app.js",
  output: {
    filename: "[chunkhash].js",
    chunkFilename: "[chunkhash].js",
    path: path.resolve(__dirname, "public/dist/"),
    publicPath: "/dist/"
  },
  devtool: "cheap-module-eval-source-map",
  devServer: {
    port: 5000,
    compress: true,
    inline: true,
    watchOptions: {
      poll: 3000,
      ignored: /node_modules/
    },
    contentBase: path.join(__dirname, 'public/dist/'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: /public\/src/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      "window.jQuery": "jquery"
    }),
    //new webpack.ProgressPlugin(),
    // new CleanWebpackPlugin({
    //   verbose: true
    // }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({
      filename: '../index.html',
      template: './public/template.html',
      favicon: './public/favicon.ico'
    }),
    //new BundleAnalyzerPlugin(),
  ]
};
