import select from '@inquirer/select';

const URL = 'https://api.github.com/licenses'
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
      const l = await select({
      message: 'Select license',
      choices: licenses
    });
      console.log('You selected:', l);
      // Perform tasks related to the 'Custom' option with selected items
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

askOptions();
