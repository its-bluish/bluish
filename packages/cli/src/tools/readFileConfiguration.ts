import fs from 'fs/promises'
import path from 'path'

export async function readFileConfiguration<T>(filename: string): Promise<T> {
  const stat = await fs.stat(filename)

  if (stat.isDirectory()) {
    const { default: configuration } = await import(filename)

    return configuration
  }

  const info = path.parse(filename)

  if (info.ext === '.json') {
    const content = await fs.readFile(filename, 'utf-8')

    return JSON.parse(content)
  }

  throw new Error('TODO')
}
