import { Middleware, Use, type UseDecorator } from '@bluish/core'
import { type DataSource } from 'typeorm'

export class InitializeDataSourceMiddleware extends Middleware {
  constructor(protected dataSource: DataSource) {
    super()
  }

  async onInitialize(): Promise<void> {
    await this.dataSource.initialize()
  }
}

export const InitializeDataSource = (dataSource: DataSource): UseDecorator =>
  Use(new InitializeDataSourceMiddleware(dataSource))
