const fs = require("fs");
const esbuild = require("esbuild");

const pluginName = "eidos-global-pkg";
const packagesToReplace = [
  "react",
  "lexical",
  "@lexical/utils",
  "@lexical/react/LexicalComposerContext",
  "@lexical/react/LexicalBlockWithAlignableContents",
];

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/index.js",
    platform: "browser",
    format: "esm",
    plugins: [
      {
        name: pluginName,
        setup(build) {
          build.onLoad({ filter: /.*/ }, async (args) => {
            let contents = fs.readFileSync(args.path, "utf8");

            packagesToReplace.forEach((packageName) => {
              const globalVarName = "__" + packageName.toUpperCase();

              // `import { a, b, c, d } from 'packageName';` => `const { a, b, c, d } = window.globalVarName;`
              contents = contents.replace(
                new RegExp(`import {([^}]+)} from "${packageName}";`, "g"),
                `const {$1} = window["${globalVarName}"];`,
              );

              // `import xxx from 'packageName';` => `const xxx = window.globalVarName;`
              contents = contents.replace(
                new RegExp(`import ([^ ]+) from "${packageName}";`, "g"),
                `const $1 = window["${globalVarName}"];`,
              );
            });

            return {
              contents,
              loader: "tsx",
            };
          });
        },
      },
    ],
  })
  .catch(() => process.exit(1));
