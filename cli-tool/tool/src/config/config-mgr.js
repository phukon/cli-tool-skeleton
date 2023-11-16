import chalk from 'chalk'
import { readPackageUp } from 'read-package-up'

export async function getConfig() {
  const pkgPath = await readPackageUp({ cwd: process.cwd() })
  const pkg = pkgPath
  console.log(pkg)
  if (pkg.packageJson.tool) {
    console.log('Found configuration')
    return pkg.packageJson.tool
  } else {
    console.log(chalk.yellow('Could not find configuration, using default'))
    return { port: 1234 }
  }
}
