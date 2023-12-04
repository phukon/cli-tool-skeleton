import { Command } from 'commander';
import { autogen } from './src/generate/gen.js';

const program = new Command();
var name;
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

const generateLicense = async () => {
  const autogenValues = await autogen({}, false);

  const { license, fullname } = autogenValues;

  console.log(`Generated License: ${license}`);
  console.log(`Fullname: ${fullname}`);
};

if (name !== '') {
  generateLicense();
}
