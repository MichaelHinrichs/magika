#! /usr/bin/env node
// Command line tool to test MagikaJs. Please use the proper command line
// tool (`pip install magika`) for any real use.

// To run this, you need to install the optional dependencies too.
import { program } from "commander";
import { readFile } from "fs/promises";
// Load the node version of tensorflow, since we're running in the command line.
import * as tf from "@tensorflow/tfjs-node";
import chalk from "chalk";
import { Magika } from "./magika.js";

program
  .description(
    "Magika JS - file type detection with ML. https://google.github.io/magika",
  )
  .option("--json-output", "Format output in JSON")
  .option(
    "--model-url <model-url>",
    "Model URL",
    "https://google.github.io/magika/model/model.json",
  )
  .option(
    "--config-url <config-url>",
    "Config  URL",
    "https://google.github.io/magika/model/config.json",
  )
  .argument("<paths...>", "Paths of the files to detect");

program.parse();

const flags = program.opts();
const magika = new Magika();
await magika.load({ modelURL: flags.modelUrl, configURL: flags.configUrl });
await Promise.all(
  program.args.map(async (path) => {
    let data = null;
    try {
      data = await readFile(path);
    } catch (error) {
      console.error("Skipping file", path, error);
    }
    const prediction = await magika.identifyBytes(data);
    if (flags.jsonOutput) {
      console.log({ path, ...prediction });
    } else {
      console.log(
        chalk.blue(path),
        chalk.green(
          prediction?.["label"],
          chalk.white(prediction?.["score"]),
          JSON.stringify(prediction),
        ),
      );
    }
  }),
);
