# angular-demo-app

This test app was added to test the interop between JSR libraries and "legaprise" (legacy, and/or enterprise) code.

Out of the box, an Angular app generated with Nx uses a bunch of CommonJS crap, and I wanted to see if an Angular app could consume JSR libraries via the JSR "[npm compatibility](https://jsr.io/docs/npm-compatibility)" later. 

The result seems to be that they can.

This demo app imports [@axhxrx/json](https://jsr.io/@axhxrx/json) via npm.

To do so, we had to run the command `npx jsr add @axhxrx/json` like this:

```
➜  jsr-deno-nx-monorepo-test git:(main) ✗ npx jsr add @axhxrx/json
Need to install the following packages:
jsr@0.13.2
Ok to proceed? (y) y

Setting up .npmrc...ok
Installing @axhxrx/json...
$ npm install @axhxrx/json@npm:@jsr/axhxrx__json

added 2 packages, and audited 1370 packages in 1s

222 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

Completed in 1s
➜  jsr-deno-nx-monorepo-test git:(main) ✗ 

➜  jsr-deno-nx-monorepo-test git:(main) ✗ tree node_modules/@axhxrx/json     
node_modules/@axhxrx/json
├── README.md
├── _dist
│   ├── mod.d.ts
│   ├── mod.d.ts.map
│   ├── sortedStringify.d.ts
│   └── sortedStringify.d.ts.map
├── deno.json
├── deno.lock
├── mod.js
├── mod.js.map
├── mod.ts
├── package.json
├── sortedStringify.js
├── sortedStringify.js.map
├── sortedStringify.test.ts
└── sortedStringify.ts

2 directories, 15 files
➜  jsr-deno-nx-monorepo-test git:(main) ✗ 
```

Obviously, there is a terrible drawback to this approach: it requires publishing to JSR every time we make a change to a library and want to use the updated library in the app. (Although JSR publishing is relatively fast, it's obviously not in the same category as a local monorepo import).

OTOH, though, everything seems to work perfectly, including inline docs and TypeScript source maps for jumping to definition, etc.

So I would consider this the "slow, but works well" approach.

To make local imports work in legaprise code (which for this purpose we can define as "code that cannot have imports that include the `.ts` file extension), as they do in Deno or Bun code, I think we would need to bundle the JSR lib's code separately.

This is not simple. The `doomed-legaprise-bundler-thing-2024-09-23` branch has my first failed attempt to do so. Why it is hard:

- Deno 2 eliminates the `deno bundle` command
- the [recommended](https://docs.deno.com/runtime/reference/migrate_deprecations/#deno-bundle) [replacement](https://jsr.io/@luca/esbuild-deno-loader) does not generate type definitions
- I couldn't find an ESBuild plugin that would generate type definitions that worked
- other bundling tools I tried don't understand the `jsr:` imports in the library source code

So... I'm not sure there is a reasonable solution. OTOH, the JSR publish step is fast enough that it might be acceptable to just say "legaprise code has to consume the published libraries". It depends on what percentage of time is spent in legaprise code.

It's frustrating, though, because all we really want to do is reproduce the outputs of the JSR build process locally. This may be possible in the future, as JSR [intends to make it possible to self-host JSR](https://github.com/jsr-io/jsr/issues/203) locally as their solution to private registries. But that is not available today.

Obviously, we could get the source code to JSR, and then figure out how to extract the "build step" that it does. But that is too much work for now.

### Other ideas

- [DNT](https://github.com/denoland/dnt)-based build-step for legaprise code to consume libs? 