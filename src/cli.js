#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as create from './commands/create.js';
import * as list from './commands/list.js';
import * as info from './commands/info.js';
import * as validate from './commands/validate.js';

yargs(hideBin(process.argv))
  .scriptName('stacksnap')
  .usage('$0 <command> [options]')
  .command(create)
  .command(list)
  .command(info)
  .command(validate)
  .demandCommand(1, 'You must provide a command.')
  .recommendCommands()
  .strict()
  .help()
  .alias('h', 'help')
  .alias('v', 'version')
  .parse();
