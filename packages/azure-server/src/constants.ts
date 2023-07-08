import os from 'os'
import path from 'path'

export const MICROSOFT_SUPPORTED_PLATFORM = (() => {
  if (os.platform() === 'win32') {
    if (os.arch() === 'arm64') return 'win-arm64'

    return 'win-x64'
  }

  if (os.platform() === 'darwin') {
    if (os.arch() === 'arm64') return 'osx-arm64'

    return 'osx-x64'
  }

  if (os.platform() === 'linux') return 'linux-x64'

  throw Error(`platform ${os.platform()} isn't supported`)
})()

export const MICROSOFT_AZURE_FUNCTIONS_VERSION = '4.0.5198'

export const MICROSOFT_AZURE_FUNCTIONS_CDN =
  'https://functionscdn.azureedge.net'

export const MICROSOFT_AZURE_FUNCTIONS_CDN_ENDPOINT = `${MICROSOFT_AZURE_FUNCTIONS_CDN}/public/${MICROSOFT_AZURE_FUNCTIONS_VERSION}/Azure.Functions.Cli.${MICROSOFT_SUPPORTED_PLATFORM}.${MICROSOFT_AZURE_FUNCTIONS_VERSION}.zip`

export const DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH = path.join(
  os.homedir(),
  '.bluish',
  'azure-function-core-tools',
  MICROSOFT_AZURE_FUNCTIONS_VERSION,
)
