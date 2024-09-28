import { type Any, TEST_VALUE_THAT_IS_NOT_PUBLISHED_TO_JSR } from 'jsr:@axhxrx/ts@0.1.2';

/**
 Like `JSON.stringify()`, but without random key ordering. This implementation sorts the keys, including for any nested objects, and outputs a strings where the keys are always in the same stable order.
 
 This avoids the potential problem with the regular `JSON.stringify()`, where it might return e.g. `'{"one": 2, "three": 4}'` one time, and `'{"three": 4, "one": 2}'` the next time, even for an equivalent data structure containing equal values.
 
 @param value - anything you can pass to JSON.stringify()
 @param space - 0 by default; pass higher integer number to pretty print by that many spaces
 */
export const sortedStringify = (value: unknown, space = 0): string => {
  return JSON.stringify(value, keySortingReplacerFunc, space);
};

/**
 Returns `true` if the `value` is a "regular object", in the sense that it is not a primitive value like a string or number, but something you could reasonably expect to be able to serialize to JSON.
 */
export const isRegularObject = (value: unknown) : boolean => {
  return value != null && Object.getPrototypeOf(value) === Object.prototype;
};

/**
 This is a `replacer` function for JSON stringify, that avoids random key ordering. It results in stable, sorted JSON, avoiding the problem where the order of keys can change pseudo-randomly when `JSON.stringify()` is used. E.g. the output might be `'{"one": 2, "three": 4}'` one time, and `'{"three": 4, "one": 2}'` the next time.
 
 By passing this replacer to `JSON.stringify()` we ensure that the output is always consistent: in this case, `'{"one": 2, "three": 4}'`.\
 
 Supports nested objects.
 
 There are a few different approaches to this, but this is the one I chose after reviewing the [StackOverflow discussion](https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify/43636793#43636793), particularly because we still (unofficially) support MSIE, and this implementation does not require newer ECMAScript features. This is IMO the best approach from that page, although I rewrote it in more readable fashion and improved the `isRegularObject()` check with some help from @jed. 🤓 😁
 
 (For complete details about `JSON.stringify()` and `replacer` functions, refer to [the spec](http://www.ecma-international.org/ecma-262/6.0/#sec-json.stringify).)
 */
const keySortingReplacerFunc = (_unusedKey: string, value: Any) => {
  if (isRegularObject(value)) {
    return Object.keys(value)
      .sort()
      .reduce((sorted: Record<string, Any>, key: string) => {
        sorted[key] = value[key];
        return sorted;
      }, {});
  } else {
    return value;
  }
};

export const fu = TEST_VALUE_THAT_IS_NOT_PUBLISHED_TO_JSR;