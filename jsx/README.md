[repl example](https://stackblitz.com/edit/artalaractjsx)

`vite.config.js`

```js
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'hf',
    jsxInject: `import { h, hf } from "@artalar/act-jsx";`,
  },
})
```

`tsconfig.json`

> https://www.solidjs.com/guides/typescript

```json
"compilerOptions": {
  "jsx": "preserve",
  "jsxImportSource": "@artalar/act-jsx"
},
```
