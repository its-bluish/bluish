/* eslint-disable no-await-in-loop */
import { portIsAvailable } from './portIsAvailable'

export async function nextPortAvailable(port: number, host?: string) {
  let current = port
  do {
    current += 1
    if (await portIsAvailable(current, host)) break
  } while (!(await portIsAvailable(current, host)))

  return current
}
