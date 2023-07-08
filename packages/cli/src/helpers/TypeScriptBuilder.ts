import path from 'path'
import fs from 'fs/promises'
import os from 'os'

import ts from 'typescript'

import { type Configuration } from '../models/Configuration.js'

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: filename => filename,
  getCurrentDirectory: ts.sys.getCurrentDirectory.bind(ts.sys),
  getNewLine: () => ts.sys.newLine,
}

interface SemiTsConfig {
  compilerOptions?: {
    rootDir?: string
    outDir?: string
  }
  exclude?: string[]
}

export default class TypeScriptBuilder {
  public program: ts.WatchOfConfigFile<ts.SemanticDiagnosticsBuilderProgram> | null =
    null

  constructor(public readonly configuration: Configuration) {}

  public getTsConfigPath(): string {
    const configFilePath = ts.findConfigFile(
      this.configuration.sourceDirectory,
      ts.sys.fileExists.bind(ts.sys),
    )

    if (!configFilePath)
      throw new Error("Could not find a valid 'tsconfig.json'.")

    return configFilePath
  }

  public static getTsConfig(tsConfigPath: string): SemiTsConfig {
    const { config, error } = ts.readConfigFile(
      tsConfigPath,
      ts.sys.readFile.bind(ts.sys),
    )

    if (error) {
      const message =
        typeof error.messageText === 'string'
          ? error.messageText
          : error.messageText.messageText
      throw new Error(message)
    }

    return config as SemiTsConfig
  }

  public find(filepath: string): string | Promise<string> {
    return (filepath.startsWith('/') ? filepath : `/${filepath}`)
      .replace(
        this.configuration.sourceDirectory,
        this.configuration.outputDirectory,
      )
      .replace(/\.ts$/, '.js')
  }

  public async build(): Promise<void> {
    const tsConfigPath = this.getTsConfigPath()

    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'bluish-typescript-'))

    await fs.copyFile(tsConfigPath, path.join(tmp, 'tsconfig.json'))

    const tsConfig = TypeScriptBuilder.getTsConfig(tsConfigPath)

    tsConfig.compilerOptions ??= {}
    tsConfig.compilerOptions.rootDir = tsConfig.compilerOptions.rootDir
      ? path.join(
          this.configuration.sourceDirectory,
          tsConfig.compilerOptions.rootDir,
        )
      : this.configuration.sourceDirectory
    tsConfig.compilerOptions.outDir = this.configuration.outputDirectory
    ;(tsConfig.exclude ??= []).push('builsh.config.ts')

    await fs.writeFile(tsConfigPath, JSON.stringify(tsConfig))

    const host = ts.createSolutionBuilderHost()

    const builder = ts.createSolutionBuilder(
      host,
      [this.configuration.sourceDirectory],
      {
        rootDir: this.configuration.sourceDirectory,
        outDir: this.configuration.outputDirectory,
      },
    )

    builder.build()

    await fs.unlink(tsConfigPath)

    await fs.copyFile(path.join(tmp, 'tsconfig.json'), tsConfigPath)
  }

  public stopWatch(): void {
    if (!this.program)
      throw new Error('There is no assisted program instance to stop')

    this.program.close()
  }

  public startWatch(): void {
    const tsConfigPath = ts.findConfigFile(
      this.configuration.sourceDirectory,
      ts.sys.fileExists.bind(ts.sys),
    )

    if (!tsConfigPath)
      throw new Error("Could not find a valid 'tsconfig.json'.")

    const host = ts.createWatchCompilerHost(
      tsConfigPath,
      {
        rootDir: this.configuration.sourceDirectory,
        outDir: this.configuration.outputDirectory,
      },
      ts.sys,
      ts.createSemanticDiagnosticsBuilderProgram,
      diagnostic => {
        // eslint-disable-next-line no-console
        console.error(
          'Error',
          diagnostic.code,
          ':',
          ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            formatHost.getNewLine(),
          ),
        )
      },
      () => void 0,
    )

    this.program = ts.createWatchProgram(host)
  }
}
