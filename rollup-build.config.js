import nodeResolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
// import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
// import { terser } from "rollup-plugin-terser";
// import { uglify } from "rollup-plugin-uglify";
import pkg from "./package.json";

const input = "./index.js";

const external = id => !id.startsWith(".") && !id.startsWith("/");

const globals = { react: "React" };

const name = "react-styled-grid-layout";

const getBabelOptions = ({ useESModules }) => ({
  exclude: "**/node_modules/**",
  runtimeHelpers: true,
  plugins: [["@babel/plugin-transform-runtime", { useESModules }]]
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
      nodeResolve(),
      babel(getBabelOptions({ useESModules: true }))
      // sizeSnapshot(),
      // terser(terserMinifyConfig)
      // uglify({ toplevel: true })
    ]
  }

  /*
  {
    input,
    output: { file: `dist/${pkg.main}`, format: 'cjs' },
    external,
    plugins: [
      babel(getBabelOptions({ useESModules: false })),
      // sizeSnapshot(),
      // terser(terserMinifyConfig)
      // uglify({ toplevel: true })
    ],
  },

  {
    input,
    output: { file: `dist/${pkg.main}`, format: 'esm' },
    external,
    plugins: [
      babel(getBabelOptions({ useESModules: true })),
      // sizeSnapshot(),
      // terser(terserMinifyConfig)
      // uglify({ toplevel: true })
    ],
  },*/
];
