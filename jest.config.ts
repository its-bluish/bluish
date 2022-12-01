import { Config } from '@jest/types'
import glob from 'glob'
import fs from 'fs'
import path from 'path'

const configuration: Config.InitialOptions = {
  preset: 'ts-jest',
  projects: glob
    .sync('<rootDir>/{packages,plugins}/*')
    .filter((fullpath) => fs.existsSync(path.join(fullpath, 'package.json')))
    .map((fullpath) => {
      const packageJsonContext = fs.readFileSync(path.join(fullpath, 'package.json'), 'utf-8')
      const packageJson = JSON.parse(packageJsonContext) as Record<string, unknown>

      return {
        preset: 'ts-jest',
        displayName: packageJson.name as string,
      }
    }),
  testMatch: ['**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  coveragePathIgnorePatterns: [
    '/.jest/',
    '<rootDir>/node_modules/',
    '<rootDir>/example/',
    '/dist/',
    '/*.d.ts',
  ],
  coverageReporters: ['lcovonly', 'text'],
  // collectCoverageFrom: ['**/src/**/*.ts'],
  coverageThreshold: {
    global: {},
  },
}

export default configuration
