import {
  type BeforeRunEvent,
  type Context,
  Middleware,
  type RunErrorEvent,
  type AfterRunEvent,
  Use,
  Selector,
} from '@bluish/core'
import {
  type ReplicationMode,
  type DataSource,
  type QueryRunner,
} from 'typeorm'
import { type IsolationLevel } from 'typeorm/driver/types/IsolationLevel.js'

export interface TransactionOptions {
  mode?: ReplicationMode
  isolationLevel?: IsolationLevel
}

export class TransactionMiddleware extends Middleware {
  constructor(
    protected dataSource: DataSource,
    protected options: TransactionOptions,
  ) {
    super()
  }

  async onBefore(event: BeforeRunEvent<Context>): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner(this.options.mode)

    await queryRunner.connect()
    await queryRunner.startTransaction(this.options.isolationLevel)

    Object.assign(event.context, { queryRunner })
  }

  async onError(event: RunErrorEvent<Context>): Promise<void> {
    const queryRunner = event.context.queryRunner as QueryRunner | undefined

    if (!queryRunner) return void 0

    await queryRunner.rollbackTransaction()
  }

  async onAfter(event: AfterRunEvent<Context>): Promise<void> {
    const queryRunner = event.context.queryRunner as QueryRunner | undefined

    if (!queryRunner) return void 0

    await queryRunner.commitTransaction()
  }
}

export const Transaction = (
  dataSource: DataSource,
  options: TransactionOptions = {},
) => {
  return (target: Object, propertyKey: string, parameterIndex: number) => {
    Use(new TransactionMiddleware(dataSource, options))(target, propertyKey)

    Selector(context => context.queryRunner)(
      target,
      propertyKey,
      parameterIndex,
    )
  }
}
