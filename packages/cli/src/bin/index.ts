#!/usr/bin/env -S node -r ts-node/register

import { program } from 'commander'
import { build } from '../commands/build'
import { install } from '../commands/install'
import { start } from '../commands/start'
import fs from 'fs/promises'
import path from 'path'

program.name('bluish')

program.addCommand(build)
program.addCommand(start)
program.addCommand(install)

void (async () => {
  const { version } = JSON.parse(
    await fs.readFile(path.join(__dirname, '..', '..', 'package.json'), 'utf-8'),
  ) as Record<string, unknown>

  program.version(version as string)

  await program.parseAsync(process.argv, { from: 'node' })
})()
