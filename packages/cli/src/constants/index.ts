import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export const LOGO = fs.readFileSync(
  path.join(
    fileURLToPath(import.meta.url),
    '..',
    '..',
    '..',
    'assets',
    'logo.txt',
  ),
  'utf-8',
)
