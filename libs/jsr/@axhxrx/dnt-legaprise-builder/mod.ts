// ex. scripts/build_npm.ts
import { build, emptyDir } from 'jsr:@deno/dnt';
import { parse } from 'https://deno.land/std@0.201.0/flags/mod.ts';

function parseArgs() {
  // Parse the command-line arguments
  const args = parse(Deno.args, {
    string: ['input', 'output'], // Specify that 'input' and 'output' expect string values
    alias: {
      i: 'input', // Map '-i' to '--input'
      o: 'output', // Map '-o' to '--output'
    },
    default: {
      input: '',
      output: '',
    },
  });

  const input = args.input;
  const output = args.output;

  return { input, output };
}

export async function main() {
  const { input, output } = parseArgs();
  if (!input || !output) {
    console.error('Please provide both input and output paths.');
    Deno.exit(1);
  }

  await emptyDir(output);

  await build({
    // @masonmark 2024-09-24: I feel like this SHOULD be enough to make DNT see that ./libs/@axhxrx/jsr/ts/mod.ts is v.0.1.2, and therefore "jsr:@axhxrx/ts@0.1.2" should resolve to the local monorepo. But it doesn'r
    importMap: '../../../../deno.jsonc',


    shims: {
      deno: true,
    },

    //   typeCheck: false,
    // declaration: true,
    scriptModule: false,
    entryPoints: [input],
    outDir: output,
    package: {
      // package.json properties
      name: '@legaprise/json',
      version: Deno.args[0],
      description: 'Your package.',
      license: 'MIT',
    },
    // postBuild() {
    //   // steps to run after building and before running the tests
    //   Deno.copyFileSync("LICENSE", "npm/LICENSE");
    //   Deno.copyFileSync("README.md", "npm/README.md");
    // },
  });
}

if (import.meta.main) {
  main();
}
