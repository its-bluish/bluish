import fs from 'fs'
import path from 'path'

import { type Config } from '@jest/types'
import { glob } from 'glob'

export default {
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  projects: glob
    .sync('<rootDir>/packages/*')
    .filter(fullpath => fs.existsSync(path.join(fullpath, 'package.json')))
    .map(fullpath => {
      const { name } = JSON.parse(
        fs.readFileSync(path.join(fullpath, 'package.json'), 'utf-8'),
      )

      return {
        preset: 'ts-jest',
        displayName: name,
      }
    }),
  collectCoverageFrom: [
    '<rootDir>/**/*.ts',
    '!<rootDir>/**/*.spec.ts',
    '!<rootDir>/node_modules/',
    '!<rootDir>/**/*.d.ts',
    '!<rootDir>/jest.*',
    '!<rootDir>/src/index.ts',
    '!<rootDir>/testing',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text'],
} satisfies Config.InitialOptions
