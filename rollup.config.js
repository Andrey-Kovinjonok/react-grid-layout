import buble from "rollup-plugin-buble";
import replace from "rollup-plugin-replace";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
// import { rph, rphMultibundles } from "rollup-plugin-hotreload";
import nodeResolve from "rollup-plugin-node-resolve";

import path from "path";

const input = "./index.js";

// const external = id => !id.startsWith('.') && !id.startsWith('/');

const globals = { react: "React" };

const name = "react-styled-grid-layout";

const getBabelOptions = ({ useESModules }) => ({
  // exclude: '**/node_modules/**',
  exclude: "node_modules/**",
  runtimeHelpers: true
  // plugins: [['@babel/plugin-transform-runtime', { useESModules }]],
});

/*
const terserMinifyConfig = {
  sourcemap: true,
  numWorkers: 4,
  output: {
    comments: function(node, comment) {
      var text = comment.value;
      var type = comment.type;
      if (type == "comment2") {
        // multiline comment
        return /@preserve|@license|@cc_on/i.test(text);
      }
    }
  },
}*/

export default [
  {
    input,
    output: {
      file: "dist/react-styled-grid-layout.umd.js",
      format: "umd",
      name,
      globals
    },
    external: Object.keys(globals),
    plugins: [
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true
      }),
      // babel(getBabelOptions({ useESModules: true })),
      babel({
        exclude: "node_modules/**"
      }),
      replace({
        exclude: "node_modules/**",
        ENV: JSON.stringify(process.env.NODE_ENV || "development")
      }),
      // (process.env.NODE_ENV === 'production' && uglify()),
      // commonjs(),
      buble()
      /*
      rph({
        templateHtmlPath: path.join(__dirname, "index.html"), // template html
        isStopRPH: false, // stop hotreload or not
        rootDir: path.join(__dirname, "dist"), // build root path
        buildPaths: [
          // first one is relative path to rootDir...
          ["dist/react-styled-grid-layout.umd.js", "index.js"]
          // as many as you want ...
        ]
      }),

      commonjs({
        // non-CommonJS modules will be ignored, but you can also
        // specifically include/exclude files
        include: 'node_modules/**',  // Default: undefined
        exclude: [ 'node_modules/foo/**', 'node_modules/bar/**' ],  // Default: undefined
        // these values can also be regular expressions
        // include: /node_modules/

        // search for files other than .js files (must already
        // be transpiled by a previous plugin!)
        extensions: [ '.js', '.coffee' ],  // Default: [ '.js' ]

        // if true then uses of `global` won't be dealt with by this plugin
        ignoreGlobal: false,  // Default: false
        // if false then skip sourceMap generation for CommonJS modules
        sourceMap: false,  // Default: true

        // explicitly specify unresolvable named exports
        // (see below for more details)
        namedExports: { './module.js': ['foo', 'bar' ] },  // Default: undefined

        // sometimes you have to leave require statements
        // unconverted. Pass an array containing the IDs
        // or a `id => boolean` function. Only use this
        // option if you know what you're doing!
        ignore: [ 'conditional-runtime-dependency' ]
      }),
      */
    ]
  }
];
