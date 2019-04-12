"use strict";
var webpack = require("webpack");
var fs = require("fs");

const optimization = {
  splitChunks: {
    chunks: "async",
    minSize: 30000,
    maxSize: 0,
    minChunks: 1,
    maxAsyncRequests: 5,
    maxInitialRequests: 3,
    automaticNameDelimiter: "~",
    name: true,
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
    }
  }
};

// Builds example bundles
module.exports = {
  mode: "development",
  context: __dirname,
  entry: {
    commons: ["lodash"]
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].bundle.js",
    sourceMapFilename: "[file].map"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          cacheDirectory: true,
          presets: [
            [
              "@babel/env",
              {
                loose: true,
                debug: false,
                modules: false,
                // modules: NODE_ENV === 'test' ? 'commonjs' : false,
                useBuiltIns: "usage",
                shippedProposals: true,
                exclude: [
                  // Unused core-js polyfills
                  "web.dom.iterable" // 40kb unzipped
                ]
              }
            ],
            "@babel/react",
            "@babel/flow"
          ],
          plugins: [
            ["@babel/proposal-class-properties", { loose: true }],
            // ['@babel/plugin-transform-runtime', { helpers: false }]
            ["@babel/plugin-transform-react-jsx-source"],
            ["@babel/plugin-syntax-dynamic-import"]
          ]
        }
      }
    ]
  },
  optimization,
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    })
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'commons', filename: 'commons.js'
    // })
  ],
  resolve: {
    extensions: [".webpack.js", ".web.js", ".js", ".jsx"],
    alias: { "react-grid-layout": __dirname + "/index-dev.js" }
  }
};

// Load all entry points
var files = fs
  .readdirSync(__dirname + "/test/examples")
  .filter(function(element, index, array) {
    return element.match(/^.+\.jsx$/);
  });

for (var idx in files) {
  var file = files[idx];
  var module_name = file.replace(/\.jsx$/, "");
  module.exports.entry[module_name] = "./test/examples/" + file;
}
