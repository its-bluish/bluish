import { AzureFunctionContext } from '../models/contexts/Context'
import { AzureHttpRequest } from '../models/contexts/HttpContext'
import { Runner } from '../models/Runner'
import { Fn } from '../typings/helpers'

export async function run<P extends string, T extends Record<P, Fn>>(
  runner: Runner<P, T>,
  context: Partial<AzureFunctionContext> = {},
  ...args: unknown[]
) {
  return runner.toAzureFunction()(context as AzureFunctionContext, ...args)
}

run.http = async <P extends string, T extends Record<P, Fn>>(
  runner: Runner<P, T>,
  {
    body = {},
    params = {},
    query = {},
    headers = {},
    method = 'GET',
    url = 'http://locahost:789',
    rawBody = '{}',
  }: Partial<AzureHttpRequest> = {},
) =>
  run(
    runner,
    {},
    {
      body,
      params,
      query,
      headers,
      method,
      url,
      rawBody,
    },
  )

run.testing = async <T extends { testing(...args: any[]): unknown }>(
  Testing: new () => T,
  context: Partial<AzureFunctionContext> = {},
  arg: unknown = {},
) => run(new Runner(Testing, 'testing'), context, arg)
