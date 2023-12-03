import select, { Separator } from '@inquirer/select';
import input from '@inquirer/input';

const URL = 'https://api.github.com/licenses'
var entries = {}
const ghdata = []
var licenses = []

fetch(URL).then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Parse the response body as JSON
  }).then((d) => {
  for (const e of d) {
 ghdata.push(e)
}

  licenses = ghdata.map(entry => ({name: entry.spdx_id, value: entry.key, description: entry.name }))

}).catch(e => console.log(e))

const askOptions = async () => {
  try {
    const answer = await select({
      message: 'Select an option',
      choices:  [
        {
          name: 'Auto',
          value: 'auto',
          description: 'Automatically generate a license using values from the package.json',
        },
        {
          name: 'Custom',
          value: 'custom',
          description: 'Build your license yourself',
        },
      ],
    });

    if (answer === 'auto') {
      console.log('You selected Auto. Generating license...');
      // Perform tasks related to the 'Auto' option
    } else if (answer === 'custom') {
      const lcs = await select({
      message: 'Select license',
      choices: [...licenses, new Separator()]
    });
      console.log('You selected:', lcs);
      entries.license = lcs
      if(lcs === 'bsd-2-clause' || lcs === 'bsd-3-clause' || lcs === 'mit') {

        const nameAnswer = await input({ message: 'Enter your name' });
        if (typeof nameAnswer !== 'string' || nameAnswer.trim().length < 1) {
            console.log('Invalid name. Please enter a valid name.');
            return;
          }

        entries.fullname = nameAnswer
        
        var dateAnswer
        var dateRegex
        do {
          dateAnswer = await input({ message: 'Enter the date' });
          dateRegex = /^\d{4}$/;
          if (!dateRegex.test(dateAnswer)) {
            console.log('Invalid date. Please enter a valid date in YYYY format.');
          }
          } while (!dateRegex.test(dateAnswer));
          entries.date = dateAnswer || new Date().getUTCFullYear();
                }
              }


    console.log(entries)
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

askOptions();
