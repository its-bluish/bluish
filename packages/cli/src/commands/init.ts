/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Command } from 'commander'
import fs from 'fs/promises'
import inquirer from 'inquirer'
import path from 'path'
import { AzuriteServices, Configuration } from '../interfaces/Configuration'

export const init = new Command('init')

init.option('-y, --yes', 'say yes to all questions', false)

init.action(async () => {
  const { yes } = init.opts()
  const prompt = inquirer.createPromptModule()

  const answers = await prompt([
    {
      type: 'input',
      message: 'Path or glob for trigger classes',
      name: 'functions',
      default: './src/functions/*.ts',
      when: () => !yes,
    },
    {
      type: 'input',
      message: 'Path to the wrapper application',
      name: 'application',
      default: null,
      when: () => !yes,
    },
    {
      type: 'checkbox',
      message: 'Select the Azurite Services you want to use',
      choices: [
        { name: 'Blob', value: 'blob' },
        { name: 'Queue', value: 'queue' },
        { name: 'Table', value: 'table' },
      ],
      name: 'azuriteServices',
      default: ['blob', 'queue', 'table'],
      when: () => !yes,
    },
    {
      type: 'confirm',
      message: 'Want to configure Azurite Services ports and/or hosts?',
      name: 'configureAzurite',
      when: (answers) => !yes && !!answers.azuriteServices.length,
    },
    {
      type: 'number',
      message: 'Port for the Azurite Blob Service',
      name: 'blob.port',
      default: 1000,
      when: (answers) => answers.configureAzurite && answers.azuriteServices.includes('blob'),
    },
    {
      type: 'input',
      message: 'Host for the Azurite Blob Service',
      name: 'blob.host',
      default: '127.0.0.1',
      when: (answers) => answers.configureAzurite && answers.azuriteServices.includes('blob'),
    },
    {
      type: 'input',
      message: 'Do you want to try starting the Azurite Blob Service locally?',
      name: 'blob.start',
      default: true,
      when: (answers) => answers.configureAzurite && answers.azuriteServices.includes('blob'),
    },
    {
      type: 'number',
      message: 'Port for the Azurite Queue Service',
      name: 'queue.port',
      default: 1001,
      when: (answers) => answers.configureAzurite && answers.azuriteServices.includes('queue'),
    },
    {
      type: 'input',
      message: 'Host for the Azurite Queue Service',
      name: 'queue.host',
      default: '127.0.0.1',
      when: (answers) => answers.configureAzurite && answers.azuriteServices.includes('queue'),
    },
    {
      type: 'input',
      message: 'Do you want to try starting the Azurite Queue Service locally?',
      name: 'queue.start',
      default: true,
      when: (answers) => answers.configureAzurite && answers.azuriteServices.includes('queue'),
    },
    {
      type: 'number',
      message: 'Port for the Azurite Table Service',
      name: 'table.port',
      default: 1002,
      when: (answers) => answers.configureAzurite && answers.azuriteServices.includes('table'),
    },
    {
      type: 'input',
      message: 'Host for the Azurite Table Service',
      name: 'table.host',
      default: '127.0.0.1',
      when: (answers) => answers.configureAzurite && answers.azuriteServices.includes('table'),
    },
    {
      type: 'input',
      message: 'Do you want to try starting the Azurite Table Service locally?',
      name: 'table.start',
      default: true,
      when: (answers) => answers.configureAzurite && answers.azuriteServices.includes('table'),
    },
    {
      type: 'list',
      message: 'What type of configuration file do you want to generate?',
      choices: [
        { name: 'bluishrc', value: 'bluishrc' },
        { name: 'bluishrc.json', value: 'bluishrc.json' },
        { name: 'bluishrc.js', value: 'bluishrc.js', disabled: true },
        { name: 'bluishrc.ts', value: 'bluishrc.ts', disabled: true },
        { name: 'bluish.config.ts', value: 'bluish.config.ts', disabled: true },
        { name: 'bluish.config.js', value: 'bluish.config.js', disabled: true },
        { name: 'bluish.config.json', value: 'bluish.config.json' },
      ],
      default: 'bluish.config.json',
      name: 'file',
      when: () => !yes,
    },
  ])

  const config = {} as Configuration

  if (yes) {
    answers.functions = './src/functions/*.ts'
    answers.azuriteServices = ['blob', 'queue', 'table']
    answers.file = 'bluish.config.json'
    answers.configureAzurite = true
    answers.blob = { host: '127.0.0.1', port: 10000, start: true }
    answers.queue = { host: '127.0.0.1', port: 10001, start: true }
    answers.table = { host: '127.0.0.1', port: 10002, start: true }
  }

  if (answers.functions) config.functions = answers.functions

  if (answers.application) config.functions = answers.application

  if (answers.azuriteServices.length) {
    if (answers.configureAzurite)
      answers.azuriteServices.forEach((service: AzuriteServices) => {
        if (typeof config.azurite !== 'object') config.azurite = {}

        config.azurite[service] = answers[service]
      })
    else config.azurite = true
  } else config.azurite = false

  await fs.writeFile(path.resolve(answers.file), JSON.stringify(config, null, 2))
})
