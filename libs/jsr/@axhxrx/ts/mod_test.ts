import { assertEquals } from "@std/assert";
import type { Any } from "./Any.ts";

Deno.test(function testAny() {
  const foo: Any = 1;
  const bar: Any = "welcome to Narnia";
  const baz: Any = [foo, bar];
  assertEquals(baz, [1, "welcome to Narnia"]);
});
