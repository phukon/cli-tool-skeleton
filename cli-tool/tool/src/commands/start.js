import chalk from 'chalk'

export function start(config) {
  console.log(chalk.gray('Received configuration in start -'), config);
  console.log(chalk.bgCyanBright('starting the app'))
}