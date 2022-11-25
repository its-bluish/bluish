import { Builder } from '../models/Builder'
import ts from 'typescript'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (filename) => filename,
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

export default class TypescriptBuilder extends Builder {
  public getTsConfigPath() {
    const configFilePath = ts.findConfigFile(this.rootDir, ts.sys.fileExists.bind(ts.sys))

    if (!configFilePath) throw new Error("Could not find a valid 'tsconfig.json'.")

    return configFilePath
  }

  public static getTsConfig(tsConfigPath: string) {
    const { config, error } = ts.readConfigFile(tsConfigPath, ts.sys.readFile.bind(ts.sys))

    if (error) throw new Error('TODO')

    return config as SemiTsConfig
  }

  public find(filepath: string): string | Promise<string> {
    return `/${filepath}`.replace(this.rootDir, this.outDir).replace(/\.ts$/, '.js')
  }

  public async build() {
    const tsConfigPath = this.getTsConfigPath()

    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'bluish-typescript-'))

    await fs.copyFile(tsConfigPath, path.join(tmp, 'tsconfig.json'))

    const tsConfig = TypescriptBuilder.getTsConfig(tsConfigPath)

    tsConfig.compilerOptions ??= {}
    tsConfig.compilerOptions.rootDir = tsConfig.compilerOptions.rootDir
      ? path.join(this.rootDir, tsConfig.compilerOptions.rootDir)
      : this.rootDir
    tsConfig.compilerOptions.outDir = this.outDir
    ;(tsConfig.exclude ??= []).push('builsh.config.ts')

    await fs.writeFile(tsConfigPath, JSON.stringify(tsConfig))

    const host = ts.createSolutionBuilderHost()

    const builder = ts.createSolutionBuilder(host, [this.rootDir], {
      rootDir: this.rootDir,
      outDir: this.outDir,
    })

    builder.build()

    await fs.unlink(tsConfigPath)

    await fs.copyFile(path.join(tmp, 'tsconfig.json'), tsConfigPath)
  }

  public watch() {
    const tsConfigPath = ts.findConfigFile(this.rootDir, ts.sys.fileExists.bind(ts.sys))

    if (!tsConfigPath) throw new Error("Could not find a valid 'tsconfig.json'.")

    const host = ts.createWatchCompilerHost(
      tsConfigPath,
      {
        rootDir: this.rootDir,
        outDir: this.outDir,
      },
      ts.sys,
      ts.createSemanticDiagnosticsBuilderProgram,
      (diagnostic) => {
        // eslint-disable-next-line no-console
        console.error(
          'Error',
          diagnostic.code,
          ':',
          ts.flattenDiagnosticMessageText(diagnostic.messageText, formatHost.getNewLine()),
        )
      },
      () => void 0,
    )

    const program = ts.createWatchProgram(host)

    return () => {
      program.close()
    }
  }
}
