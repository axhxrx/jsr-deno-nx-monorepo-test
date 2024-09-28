# dnt-legaprise-builder

This lib builds JSR packages as local NPM packages.

The purpose of this is so that legaprise code, which cannot use Deno's non-insane import syntax, can still consume the JSR packages as local monorepo libs.

I'm not sure this approach is sane or scalable enough to actually use; this is an experiment. (@masonmark 2024-09-28)

## how to use

Well, it should be run via the monorepo management tool, currently Nx. So that looks like this:

```shell
➜  jsr-deno-nx-monorepo-test git:(main) ✗ nx run @axhxrx/json:build-for-legaprise
```

What that is doing is executing the `build-for-legaprise` target of the `@axhxrx/json` library. That build target is defined such that it uses this dnt-legaprise-builder lib to build the `@axhxrx/json` library.

But to run it manually, you can do this:

```shell
cd libs/jsr/@axhxrx/dnt-legaprise-builder 
deno -A mod.ts --input TARGET_LIB_ENTRY_POINT --output DESTINATION_BUILD_DIR
```

Note: You need to be in the libs/jsr/@axhxrx/dnt-legaprise-builder when you use the builder, not the root of the repo nor the directory of the library you're building. The Nx command handles that, so it should be run from the rep root.