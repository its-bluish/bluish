import { AzureFunctionContext } from '../models/contexts/Context'
import { AzureHttpRequest } from '../models/contexts/HttpContext'
import { Runner } from '../models/Runner'
import { Fn } from '../typings/helpers'

export async function run<P extends string, T extends Record<P, Fn>>(
  runner: Runner<P, T>,
  context: Partial<AzureFunctionContext> = {},
  arg: unknown = {},
) {
  return runner.toAzureFunction()(context as AzureFunctionContext, arg)
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
