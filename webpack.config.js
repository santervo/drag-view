var path = require("path");
module.exports = {
  entry: {
    app: ["./example/example.js"]
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: ['es2015']
      }
    }],
  },
  output: {
    publicPath: "/build/",
    filename: "bundle.js"
  },
  devtool: 'source-map'
};
