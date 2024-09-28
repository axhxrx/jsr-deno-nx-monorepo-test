# jsr-deno-nx-monorepo-test

This repo exists to serve as a reproduction case for 

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
