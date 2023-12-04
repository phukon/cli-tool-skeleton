import select, { Separator } from '@inquirer/select';
import input from '@inquirer/input';
import confirm from '@inquirer/confirm';
import pc from 'picocolors';
import fs from 'fs';

const URL = 'https://api.github.com/licenses';
const entries = {};
const ghdata = [];
let licenses = [];
let isSuccess = false;

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

      if (answer === 'auto') {
        console.log(
          pc.bold(pc.blue('You selected Auto. Reading package.json...'))
        );
        // Perform tasks related to the 'Auto' option
      } else if (answer === 'custom') {
        const lcs = await select({
          message: 'Select license',
          choices: [...licenses, new Separator()],
        });
        entries.license = lcs;

        if (lcs === 'BSD-2-Clause' || lcs === 'BSD-3-Clause' || lcs === 'MIT') {
          let nameAnswer;
          do {
            nameAnswer = await input({ message: 'Enter your name' });
            if (
              typeof nameAnswer !== 'string' ||
              nameAnswer.trim().length < 1
            ) {
              console.log('Invalid name. Please enter a valid name.');
            }
          } while (
            typeof nameAnswer !== 'string' ||
            nameAnswer.trim().length < 1
          );

          entries.fullname = nameAnswer;

          let dateAnswer;
          const dateRegex = /^\d{4}$/;
          do {
            dateAnswer = await input({ message: 'Enter the date' });
            if (!dateRegex.test(dateAnswer)) {
              console.log(
                'Invalid date. Please enter a valid date in YYYY format.'
              );
            }
          } while (!dateRegex.test(dateAnswer));
          entries.date = dateAnswer || new Date().getUTCFullYear();
        }
      }

      console.log(`License: ${entries.license}\nName: ${entries.fullname}`);
      const check = await confirm({ message: 'Continue?' });
      if (check) {
        let fffx = `${URL}/${entries.license}`;
        console.log(fffx);
        fetch(fffx)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            fs.writeFile('LICENSE', data.body, (err) => {
              if (err) {
                console.error('Error writing to file:', err);
              } else {
                console.log('Data has been written to');
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
