const HtmlWebpackPlugin = require("html-webpack-plugin");
const { merge } = require("webpack-merge");
const base = require("./webpack.config");
const path = require("path");

module.exports = merge(base, {
  mode: "production",
  devtool: "nosources-source-map", //https://webpack.js.org/configuration/devtool/ && https://github.com/webpack/webpack/issues/5627#issuecomment-389492939
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "app/src/index-prod.html"),
      filename: "index-prod.html"
    })
  ]
});
