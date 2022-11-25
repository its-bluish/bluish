import { Config } from '@jest/types'
import glob from 'glob'
import fs from 'fs'
import path from 'path'

const configuration: Config.InitialOptions = {
  preset: 'ts-jest',
  projects: glob
    .sync('<rootDir>/packages/*')
    .filter((fullpath) => fs.existsSync(path.join(fullpath, 'package.json')))
    .map((fullpath) => {
      const packageJsonContext = fs.readFileSync(path.join(fullpath, 'package.json'), 'utf-8')
      const packageJson = JSON.parse(packageJsonContext) as Record<string, unknown>
      return {
        preset: 'ts-jest',
        displayName: packageJson.name as string,
        testMatch: [fullpath],
        setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      }
    }),
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

export default configuration
