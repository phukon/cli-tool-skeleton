import { Command } from "commander";
import { getConfig } from "./src/config/config-mgr";




const program = new Command();
var name
program
  .name('\n\nauto-lgen')
  .description('generate licenses for your project blazing fast')
  .version('0.8.0')
  .description('Automatically generate a license using the package.json file')
  .option('-n, --name <string>', 'separator character', '')
  .action((options) => {
    name = options.name;
  });

program.parse();

console.log(name)

const config = await getConfig()
console.log(config)