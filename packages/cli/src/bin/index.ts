#!/usr/bin/env node

import { program } from 'commander'

import start from './commands/start.js'

program.addCommand(start)

void (async () => {
  await program.parseAsync(process.argv)
})()
