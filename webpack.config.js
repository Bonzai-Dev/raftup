const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // Import the plugin
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
  entry: path.resolve(appDirectory, "src/index.ts"), //path to the main .ts file
  output: {
    filename: "js/bundle.js", //name for the js file that is created/compiled in memory
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@/public": path.resolve(appDirectory, "public"),
      "@": path.resolve(appDirectory, "src"),
    },
  },
  devServer: {
    host: "0.0.0.0",
    port: 3000, //port that we"re using for local host (localhost:8080)
    static: path.resolve(appDirectory, "public"), //tells webpack to serve from the public folder
    hot: true,
    devMiddleware: {
      publicPath: "/",
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(appDirectory, "./index.html"),
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          "css-loader",
        ],
      },
    ],
  },
  mode: "development",
};
