/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { CoreEmitter } from '../helpers/CoreEmitter'
import { ApplicationConfiguration } from '../models/ApplicationConfiguration'
import { Source } from '../models/Source'

export function waitForSourceOrApplicationConfiguration(
  target: Function | Object,
  callback: (sourceOrApplicationConfiguration: Source | ApplicationConfiguration) => void,
) {
  const constructor = typeof target === 'function' ? target : target.constructor

  const source = Source.get(target)

  if (source) return callback(source)

  if (ApplicationConfiguration.isSame(target)) return callback(ApplicationConfiguration.set(target))

  const removeSourceListener = CoreEmitter.on('source', (maybeThatSource) => {
    if (maybeThatSource.target === constructor) call(maybeThatSource)
  })

  const removeApplicationConfigurationListener = CoreEmitter.on(
    'application-configuration',
    (applicationConfiguration) => {
      if (applicationConfiguration.target === constructor) call(applicationConfiguration)
    },
  )

  function call(sourceOrApplicationConfiguration: Source | ApplicationConfiguration) {
    removeSourceListener()
    removeApplicationConfigurationListener()
    callback(sourceOrApplicationConfiguration)
  }

  return void 0
}
