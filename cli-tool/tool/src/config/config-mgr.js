import chalk from 'chalk';
import { cosmiconfigSync } from 'cosmiconfig';
import fs from 'fs';
import Ajv from 'ajv';
import betterAjvErrors from 'better-ajv-errors';

const ajv = new Ajv();
const configLoader = cosmiconfigSync('tool');

/*
Import assertion are experimental. Therfore I tried loading the JSON from the filesystem synchronously.

 ---Use this code beloew if you want to use import assertions---
  import schema from './schema.json' assert { type: 'json' };
*/

const loadJSON = (path) =>
  JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));

const schema = loadJSON('./schema.json');


export async function getConfig() {
  const result = configLoader.search(process.cwd());

  if (!result) {
    console.log(chalk.yellow('Could not find configuration, using default'));
    return { port: 1234 };
  } else {
    const isValid = ajv.validate(schema, result.config);
    if (!isValid) {
      console.log(chalk.yellow('Invalid configuration was supplied'));
      console.log();
      console.log(betterAjvErrors(schema, result.config, ajv.errors));
      process.exit(1);
    }
    console.log('Found configuration', result.config);
    return result.config;
  }
}
