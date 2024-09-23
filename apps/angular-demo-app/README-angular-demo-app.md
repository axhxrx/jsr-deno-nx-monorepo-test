# angular-demo-app

This test app was added to test the interop between JSR libraries and "legaprise" (legacy, and/or enterprise) code.

Out of the box, an Angular app generated with Nx uses a bunch of CommonJS crap, and I wanted to see if an Angular app could consume JSR libraries via the JSR "[npm compatibility](https://jsr.io/docs/npm-compatibility)" later. 

The result seems to be that they can. There are 2 ways, the slow way, and the faster way which doesn't work in my current implementation, but in theory seems like it could be made to work.

## slow, but works well: publish the libs, and use JSR's npm compatibility layer

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

Instead, I tried a similar approach using [DNT](https://github.com/denoland/dnt):

## add a different build step, specifically for legaprise code, that builds the libs as npm packages

> NOTE: this is not a working solution, because DNT doesn't understand how to handle "workspace" libraries and use them instead of the JSR version. 

My first try at this approach uses a [DNT](https://github.com/denoland/dnt)-based build-step to build the Deno libs as npm packages, specifically for legaprise code to consume. 

This is reasonably fast after the first run. In this example, we build the lib (for some reason, it only works when run from `libs/jsr/@axhxrx/dnt-legaprise-builder`) like this:

```shell
➜  dnt-legaprise-builder git:(main) ✗ time deno -A mod.ts -i ../json/mod.ts -o ../../../../built/@axhxrx/json
[dnt] Transforming...
[dnt] Running npm install...

added 3 packages, and audited 4 packages in 545ms

found 0 vulnerabilities
[dnt] Building project...
[dnt] Type checking ESM...
[dnt] Emitting ESM package...
[dnt] Emitting script package...
[dnt] Running tests...

> @legaprise/json@-i test
> node test_runner.js

[dnt] Complete!
deno -A mod.ts -i ../json/mod.ts -o ../../../../built/@axhxrx/json  2.68s user 0.56s system 134% cpu 2.411 total
➜  dnt-legaprise-builder git:(main) ✗ 
```

That process builds the library as an npm package:

```shell
➜  jsr-deno-nx-monorepo-test git:(main) ✗ tree ./built/@axhxrx/json -I node_modules
./built/@axhxrx/json
├── esm
│   ├── deps
│   │   └── jsr.io
│   │       └── @axhxrx
│   │           └── ts
│   │               └── 0.1.1
│   │                   ├── Any.d.ts
│   │                   ├── Any.d.ts.map
│   │                   ├── Any.js
│   │                   ├── mod.d.ts
│   │                   ├── mod.d.ts.map
│   │                   └── mod.js
│   ├── mod.d.ts
│   ├── mod.d.ts.map
│   ├── mod.js
│   ├── package.json
│   ├── sortedStringify.d.ts
│   ├── sortedStringify.d.ts.map
│   └── sortedStringify.js
├── package-lock.json
├── package.json
├── src
│   ├── deps
│   │   └── jsr.io
│   │       └── @axhxrx
│   │           └── ts
│   │               └── 0.1.1
│   │                   ├── Any.ts
│   │                   └── mod.ts
│   ├── mod.ts
│   └── sortedStringify.ts
└── test_runner.js

13 directories, 20 files
➜  jsr-deno-nx-monorepo-test git:(main) ✗ 
```

Then, in the `./tsconfig.base.json`, we add the following:
```json
    "paths": {
      "@axhxrx/json": [
        "built/@axhxrx/json/esm/mod.d.ts",
        "built/@axhxrx/json/esm/mod.js",
      ]
    }
```

Mapping that import specifier to both the `mod.js` abd the `mod.d.ts` file makes the Angular compiler happy, and makes TypeScript features like jump-to-definition and auto-complete work.

In this initial version, I just made the command work on the CLI when run manually. But, to use this approach for real, we would want to automate it, and use Nx to cache the results and only actually run the command when the source code to the lib has actually changed. Then we could make it a build dependency of the Angular app.

But, unfortunately, this approach doesn't work at all when you have the scenario of "working on a yet-unpublished version of the library". 

This seems to be a limitation of DNT, so we'd have to fix this bug in DNT to make this work. Here is an example:

```
➜  dnt-legaprise-builder git:(main) ✗ deno -A mod.ts -i ../json/mod.ts -o ../../../../built/@axhxrx/json 
[dnt] Transforming...
error: Uncaught (in promise) "Could not find version of '@axhxrx/ts' that matches specified version constraint '0.1.2'\n    at file:///Volumes/STUFF/CODE/jsr-deno-nx-monorepo-test/libs/jsr/@axhxrx/json/sortedStringify.ts:1:26 (jsr:@axhxrx/ts@0.1.2)"
➜  dnt-legaprise-builder git:(main) ✗ 
```

What is happening here is that we have a new version of `@axhxrx/ts`, 0.1.2, which exists only in the monorepo, and we have updated `@axhxrx/json` to depend on it:

```
// In libs/jsr/@axhxrx/json/sortedStringify.ts

import type { Any } from 'jsr:@axhxrx/ts@0.1.2'

// ...
```

DNT freaks out and dies, which shows that a.) it doesn't understand how to handle "workspace" libraries, and b.) it is always using the JSR version of the library, so if we hadn't bumped the version, we would not be getting an error but we would still be inadvertently using the wrong code (which might be hard to notice).

Running `deno test` on the other hand works properly:

```
➜  jsr-deno-nx-monorepo-test git:(main) ✗ deno test
Check file:///Volumes/STUFF/CODE/jsr-deno-nx-monorepo-test/libs/jsr/@axhxrx/json/sortedStringify.test.ts
Check file:///Volumes/STUFF/CODE/jsr-deno-nx-monorepo-test/libs/jsr/@axhxrx/ts/mod_test.ts
running 1 test from ./libs/jsr/@axhxrx/json/sortedStringify.test.ts
sortedStringify ...
  should emit different strings for different structures ... ok (1ms)
  should emit identical strings for equivalent structures ... ok (0ms)
  should emit identical strings for equivalent structures with expected output ... ok (0ms)
sortedStringify ... ok (1ms)
running 1 test from ./libs/jsr/@axhxrx/ts/mod_test.ts
testAny ... ok (0ms)

ok | 2 passed (3 steps) | 0 failed (17ms)

➜  jsr-deno-nx-monorepo-test git:(main) ✗ 
```

So... DNT doesn't work with monorepos in the same way that Deno itself does. It should be considered a bug in DNT, but with JSR out now, I am not sure how much of a priority DNT will continue to be for Deno Land Inc.

To me, using DNT is a lot less desirable than just using the exact same build process that JSR uses, but locally. So I'm not inclined to continue this DNT approach.
