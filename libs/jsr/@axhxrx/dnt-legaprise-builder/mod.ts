// ex. scripts/build_npm.ts
import { build, emptyDir } from "jsr:@deno/dnt";
import { parse } from "https://deno.land/std@0.201.0/flags/mod.ts";

function parseArgs() {
  // Parse the command-line arguments
  const args = parse(Deno.args, {
    string: ["input", "output"], // Specify that 'input' and 'output' expect string values
    alias: {
      i: "input", // Map '-i' to '--input'
      o: "output", // Map '-o' to '--output'
    },
    default: {
      input: "",
      output: "",
    },
  });

  const input = args.input;
  const output = args.output;

  return { input, output };
}

export async function main() {
  console.warn("NOTE! THIS DOES NOT WORK! IT DOES NOT UNDERSTAND MONOREPO DEPENDENCIES — REFER TO THE README AT:\n\napps/angular-demo-app/README-angular-demo-app.md\n\nFOR MORE DETAILS");

  const { input, output } = parseArgs();
  if (!input || !output) {
    console.error("Please provide both input and output paths.");
    Deno.exit(1);
  }

  await emptyDir(output);

  await build({
    //   typeCheck: false,
    // declaration: true,
      scriptModule: false,
    entryPoints: [input],
    outDir: output,
    shims: {
      // see JS docs for overview and more options
      deno: true,
    },
    package: {
      // package.json properties
      name: "@legaprise/json",
      version: Deno.args[0],
      description: "Your package.",
      license: "MIT",
   
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
