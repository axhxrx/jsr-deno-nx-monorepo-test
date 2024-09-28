# jsr-deno-nx-monorepo-test

This repo is published mainly to serve as a reproduction case for an issue I filed relating to the [@denoland/dnt](https://github.com/denoland/dnt) project.

With regards to that issue:

- in the root of the monorepo, run `deno test` to prove it works.
- `cd libs/jsr/@axhxrx/dnt-legaprise-builder`
- `deno -A mod.ts -i ../json/mod.ts -o ../../../../dist/@axhxrx/json`

That should work, and look something like this:

```shell
➜  dnt-legaprise-builder git:(main) deno -A mod.ts -i ../json/mod.ts -o ../../../../dist/@axhxrx/json
[dnt] Transforming...
[dnt] Running npm install...

added 3 packages, and audited 4 packages in 1s

found 0 vulnerabilities
[dnt] Building project...
[dnt] Type checking ESM...
[dnt] Emitting ESM package...
[dnt] Running tests...

> @legaprise/json@-i test
> node test_runner.js

[dnt] Complete!
➜  dnt-legaprise-builder git:(main) 
```

But then, modify `libs/jsr/@axhxrx/json/sortedStringify.ts` so that the import line at the top of the file adds a `@0.1.2` version specifier to the import.

```ts
import { type Any, TEST_VALUE_THAT_IS_NOT_PUBLISHED_TO_JSR } from 'jsr:@axhxrx/ts@0.1.2';
```

Then go back to the root of the monorepo, and repeat the above steps. Deno will still work, but now the `dnt-legaprise-builder` library will fail to build with DNT :

````shell
➜  dnt-legaprise-builder git:(main) ✗ deno -A mod.ts -i ../json/mod.ts -o ../../../../dist/@axhxrx/json
[dnt] Transforming...
error: Uncaught (in promise) "Could not find version of '@axhxrx/ts' that matches specified version constraint '0.1.2'\n    at file:///Volumes/STUFF/CODE/jsr-deno-nx-monorepo-test/libs/jsr/@axhxrx/json/sortedStringify.ts:1:67 (jsr:@axhxrx/ts@0.1.2)"
➜  dnt-legaprise-builder git:(main) ✗ 
```

That is unfortunate. Deno supports the "workspace" feature and so it understands that this repo is the home of these libs, so it checks the version of the local libs (the deno.json files for each library, used by JSR). It seems that DNT does not understand the "workspaces" feature, so it does not work at all to package local monorepo libs that depend on other libs.

We can get close by manually adding the "importMap" in the root deno.jsonc file, and doing the equivalent of what `"workspace"` is doing for us. Then we provide the "importMap" to DNT.

But it seems to me that workspaces should be supported directly by DNT, so that it can resolve imports of local monorepo libraries in the same way that Deno does. I'm also a little worried that adding an "importMap" that covers the same libraries that are getting automagically resolved by the "workspaces" feature might be confusing, either to us developers or to Deno itself. In my limited testing, though, Deno resolves the local libs correctly, based on the "workspace" configuration, and adding the redundant "importMap" doesn't seem to cause any problems for Deno.

(@masonmark 2024-09-28)


---

This repo is a test/demonstration of a monorepo setup using Deno. I wrote this to learn how it works, and to test it and prove that it works how I think it does.

As of this writing 2024-09-23, the "workspaces" feature isn't yet covered in the [docs](https://docs.deno.com/runtime/fundamentals/configuration/) and Deno 2 is not yet released. (I created this repo using `deno 2.0.0-rc.4`.)

## what

This monorepo contains two libraries, both of which are published to JSR.

Via the config in `./deno.jsonc`, one library can depend on the other, and Deno will automatically use the local source code instead of trying to fetch the published version from JSR.

The commit history has the details. Summary:

In `libs/jsr/@axhxrx/json/sortedStringify.ts`:

```ts
import type { Any } from 'jsr:@axhxrx/ts@0.2.0'
```

The above import refers to a future version of the `@axhxrx/ts` library. It hasn't been published yet, and in fact does not exist locally either. Therefore, the consuming library (`@axhxrx/json`) will fail to build/test:

```shell
➜  jsr-deno-nx-monorepo-test git:(main) ✗ deno test                           
Warning Workspace member '@axhxrx/ts@0.1.1' was not used because it did not match '@axhxrx/ts@0.2.0'
    at file:///Volumes/STUFF/CODE/jsr-deno-nx-monorepo-test/libs/jsr/@axhxrx/json/sortedStringify.ts:1:26
error: Could not find version of '@axhxrx/ts' that matches specified version constraint '0.2.0'
    at file:///Volumes/STUFF/CODE/jsr-deno-nx-monorepo-test/libs/jsr/@axhxrx/json/sortedStringify.ts:1:26
➜  jsr-deno-nx-monorepo-test git:(main) ✗
```

Note that Deno explains that it couldn't find a version of `@axhxrx/ts` that matched the version constraint `0.2.0`. We then get the expected error.

Next, we modify `libs/jsr/@axhxrx/ts/deno.json` and change the version to `0.2.0`. Now the local monorepo's version of `@axhxrx/ts` matches the version constraint of the import in `libs/jsr/@axhxrx/json/sortedStringify.ts`. Deno will now use the local source code instead of trying to fetch the published version from JSR, so everything works as expected:

```shell
➜  jsr-deno-nx-monorepo-test git:(main) ✗ deno test 
Check file:///Volumes/STUFF/CODE/jsr-deno-nx-monorepo-test/libs/jsr/@axhxrx/json/sortedStringify.test.ts
Check file:///Volumes/STUFF/CODE/jsr-deno-nx-monorepo-test/libs/jsr/@axhxrx/ts/mod_test.ts
running 1 test from ./libs/jsr/@axhxrx/json/sortedStringify.test.ts
sortedStringify ...
  should emit different strings for different structures ... ok (0ms)
  should emit identical strings for equivalent structures ... ok (0ms)
  should emit identical strings for equivalent structures with expected output ... ok (0ms)
sortedStringify ... ok (0ms)
running 1 test from ./libs/jsr/@axhxrx/ts/mod_test.ts
testAny ... ok (0ms)

ok | 2 passed (3 steps) | 0 failed (14ms)

➜  jsr-deno-nx-monorepo-test git:(main) ✗ 
```

## and?

### what happens if the same version of a library being imported exists in both JSR and the local monorepo?

I'm 99% sure that the local monorepo's version will be used any time the library's version matches the version constraint in the import statement. That's what happened in all of my testing.

It's therefore possible to accidentally use the local monorepo's version of a library, instead of the published version from JSR, and then accidentally write code that doesn't work with the JSR version that it claims to be importing. 

So, we need to be careful with the version number.
