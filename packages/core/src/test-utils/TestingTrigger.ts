import { Trigger } from '../decorators/triggers/Trigger'
import { TestingContext } from './TestingContext'

export function TestingTrigger() {
  return Trigger({ Context: TestingContext })
}
