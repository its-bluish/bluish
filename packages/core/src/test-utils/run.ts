import { AzureFunctionContext } from '../models/contexts/Context'
import { Runner } from '../models/Runner'

export function run(runner: Runner, context: Partial<AzureFunctionContext> = {}, arg: any = {}) {
  return runner.toAzureFunction()((context ?? {}) as AzureFunctionContext, arg)
}
