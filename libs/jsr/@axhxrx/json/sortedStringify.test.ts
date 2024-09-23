import { assertEquals, assertNotEquals } from "@std/assert";
import { sortedStringify } from './sortedStringify.ts';

const uno = {
  amps: 5,
  food: 'carrot',
  friends: ['Amy', 'Bob'],
};

const dos = {
  friends: ['Amy', 'Bob'],
  food: 'slime mold',
  amps: 66,
};

Deno.test("sortedStringify", async (t) => {
  await t.step("should emit different strings for different structures", () => {
    const json1 = sortedStringify(uno);
    const json2 = sortedStringify(dos);

    assertNotEquals(json1, json2);
  });

  await t.step("should emit identical strings for equivalent structures", () => {
    dos.food = 'carrot';
    dos.amps = 5;
    const json1 = sortedStringify(uno);
    const json2 = sortedStringify(dos);

    assertEquals(json1, json2);
  });

  await t.step("should emit identical strings for equivalent structures with expected output", () => {
    dos.food = 'carrot';
    dos.amps = 5;

    const expectedJson = '{"amps":5,"food":"carrot","friends":["Amy","Bob"]}';

    const actualJson = sortedStringify(dos);
    assertEquals(actualJson, expectedJson);
  });
});
