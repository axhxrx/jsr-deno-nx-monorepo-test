import { Any } from 'jsr:@axhxrx/ts@0.1.1';
import { sortedStringify } from 'jsr:@axhxrx/json@0.1.2';

class Beast {
  constructor(readonly name: string, readonly power: Any = {fire: true, electricity: true, radiation: false}) {
  }
}

const main = (args: Any) => {
  const x: Any = 1;
  console.log('x is: ', x);
  const y: Any = "welcome to Narnia";
  console.log('y is: ', y);

  console.log('args:', args);

  const beast = new Beast('Beast');
  console.log('beast:', sortedStringify(beast));
  
  console.warn('END OF PROGRAM');
};

if (import.meta.main) {
  main(Deno.args);
}