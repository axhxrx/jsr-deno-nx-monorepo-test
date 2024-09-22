// eslint-disable @typescript-eslint/no-explicit-any

/**
 The `Any` type is a stand-in for `any` that can be used in type declarations.

 It means "yes, I mean to use `any` here" and makes it unnecessary to litter files with linter-specific pragma comments to disable the warning about using `any`.
 */
// deno-lint-ignore no-explicit-any
export type Any = any;

/**
 The `LegacyAny` type is a stand-in for `any` that can be used in type declarations. It is similar to `Any`, but means something different: "Someday we should fix this usage of `any`, but for now we aren't doing that because we are migrating legacy code and want to keep fidelity with the old code."
 */
// deno-lint-ignore no-explicit-any
export type LegacyAny = any;
