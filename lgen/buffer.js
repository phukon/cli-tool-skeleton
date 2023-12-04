import select, { Separator } from '@inquirer/select';
import input from '@inquirer/input';
import confirm from '@inquirer/confirm';
import pc from 'picocolors';
import fs from 'fs';
import { autogen } from './src/generate/gen.js';

const URL = 'https://api.github.com/licenses';
const entries = {};
const ghdata = [];
let licenses = [];
let isSuccess = false;
var flag = false;
const replacePlaceholders = (text, fullname, year) => {
  return text.replace(/\[fullname\]/g, fullname).replace(/\[year\]/g, year);
};

const fetchData = async () => {
  try {
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    for (const e of data) {
      ghdata.push(e);
    }
    licenses = ghdata.map((entry) => ({
      name: entry.spdx_id,
      value: entry.key,
      description: entry.name,
    }));
    isSuccess = true;
  } catch (error) {
    console.log('Please check your network connectivity', error);
  }
};

const askOptions = async () => {
  try {
    await fetchData();

    if (isSuccess) {
      const answer = await select({
        message: 'Select an option',
        choices: [
          {
            name: 'Auto',
            value: 'auto',
            description:
              'Automatically generate a license using values from the package.json',
          },
          {
            name: 'Custom',
            value: 'custom',
            description: 'Build your license yourself',
          },
        ],
      });
// ---- autogen----
      if (answer === 'auto') {
        console.log(
          pc.bold(pc.blue('You selected Auto. Reading package.json...'))
        );
        const autogenValues = await autogen(entries, flag);
        entries.license = autogenValues.license;
        entries.fullname = autogenValues.fullname;
        flag = autogenValues.flag;
// ------ --------  -------        
      } else if (answer === 'custom') {
        const lcs = await select({
          message: 'Select license',
          choices: [...licenses, new Separator()],
        });
        entries.license = lcs;

        if (
          entries.license === 'bsd-2-clause' ||
          entries.license === 'bsd-3-clause' ||
          entries.license === 'mit' ||
          entries.license === 'isc'
        )
          flag = true;

        if (flag) {
          let nameAnswer;
          do {
            nameAnswer = await input({ message: 'Enter your name:' });
            if (
              typeof nameAnswer !== 'string' ||
              nameAnswer.trim().length < 1
            ) {
              console.log('Invalid name. Please enter a valid name!');
            }
          } while (
            typeof nameAnswer !== 'string' ||
            nameAnswer.trim().length < 1
          );

          entries.fullname = nameAnswer;

          let dateAnswer;
          const dateRegex = /^\d{4}$/;
          do {
            dateAnswer = await input({
              message: 'Enter the year (leave it black to auto-generate):',
            });
            if (!dateRegex.test(dateAnswer) && dateAnswer.trim() !== '') {
              console.log(
                'Invalid date. Please enter a valid date in YYYY format (leave it blank): '
              );
            }
          } while (!dateRegex.test(dateAnswer) && dateAnswer.trim() !== '');

          // If dateAnswer is empty, set entries.date to the current year
          entries.date =
            dateAnswer.trim() === '' ? new Date().getUTCFullYear() : dateAnswer;
        }
      }

      flag
        ? console.log(
            `\nLicense: ${entries.license}\nName: ${entries.fullname}`
          )
        : console.log(`\nLicense: ${entries.license}`);

      const check = await confirm({ message: 'Continue?' });
      if (check) {
        fetch(`${URL}/${entries.license}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            const modifiedLicense = replacePlaceholders(
              data.body,
              entries.fullname,
              entries.date || new Date().getUTCFullYear()
            );
            fs.writeFile('LICENSE', modifiedLicense, (err) => {
              if (err) {
                console.error('Error writing to file:', err);
              } else {
                console.log('LICENSE generated!');
              }
            });
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
          });
      }
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

askOptions();
