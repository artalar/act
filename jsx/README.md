[repl example](https://stackblitz.com/edit/artalaractjsx)

`tsconfig.json`

```
"compilerOptions": {
  "jsx": "preserve",
  "jsxFactory": "h",
  "jsxFragmentFactory": "hf",
  "jsxImportSource": "@artalar/act/jsx"
},
```

`vite.config.js`

```
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'hf',
    jsxInject: `import { h, hf } from "@artalar/act/jsx";`,
  },
});

```
