module.exports = {
  presets: [["@babel/env", { loose: true }], "@babel/flow", "@babel/react"],
  plugins: [
    ["@babel/proposal-class-properties", { loose: true }],
    ["@babel/plugin-transform-runtime", { helpers: false }]
  ]
};
//     ["@babel/plugin-transform-runtime", { "helpers": false }],
//     "@babel/plugin-proposal-class-properties",
//     "@babel/plugin-proposal-object-rest-spread"
