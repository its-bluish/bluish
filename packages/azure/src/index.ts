import { type ConfigurationRawInput } from '@bluish/cli'

export default {
  drivers: ['@bluish/azure-drivers'],
  frames: ['@bluish/azure-drivers'],
  servers: ['@bluish/azure-server'],
} satisfies Partial<ConfigurationRawInput>
