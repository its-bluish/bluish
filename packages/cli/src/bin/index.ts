#!/usr/bin/env -S node -r ts-node/register

import { program } from 'commander'
import { build } from '../commands/build'
import { install } from '../commands/install';
import { start } from '../commands/start';

program.addCommand(build)
program.addCommand(start)
program.addCommand(install)

;(async () => await program.parseAsync(process.argv, { from: 'node' }))()
