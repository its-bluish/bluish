import path from 'path'
import { fileURLToPath } from 'url'

import { DataSource } from 'typeorm'

export const database = new DataSource({
  type: 'sqljs',
  entities: [path.join(fileURLToPath(import.meta.url), '..', 'entities', '*')],
  synchronize: true,
  location: path.resolve('.db'),
  autoSave: true,
  dropSchema: false,
  logger: 'advanced-console',
  logging: 'all',
})
