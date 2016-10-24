var path = require("path");
module.exports = {
  entry: {
    app: ["./src/index.js"]
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
  externals: [
    {
      jquery: {
        commonjs: 'jquery',
        commonjs2: 'jquery',
        amd: 'jquery',
        root: 'jQuery'
      }
    },
    {
      hammerjs: {
        commonjs: 'hammerjs',
        commonjs2: 'hammerjs',
        amd: 'hammerjs',
        root: 'Hammer'
      }
    },
    'jquery.transit'
  ],
  output: {
    library: 'DragView',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'lib'),
    publicPath: "/build/",
    filename: "drag-view.js"
  }
};
