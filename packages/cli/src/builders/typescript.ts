import { Builder } from "../models/Builder";
import ts from 'typescript'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: path => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine
};

export default class TypescriptBuilder extends Builder {
  public getTsConfigPath() {
    const path = ts.findConfigFile(this.rootDir, ts.sys.fileExists)

    if (!path) throw new Error("Could not find a valid 'tsconfig.json'.");

    return path
  }

  public static getTsConfig(path: string) {
    const { config, error } = ts.readConfigFile(path, ts.sys.readFile)

    if (error) throw error;
    
    return config
  }

  public find(path: string): string | Promise<string> {
    return `/${path}`.replace(this.rootDir, this.outDir).replace(/\.ts$/, '.js')
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
    const tsConfigPath = ts.findConfigFile(this.rootDir, ts.sys.fileExists)

    if (!tsConfigPath) throw new Error("Could not find a valid 'tsconfig.json'.");

    const host = ts.createWatchCompilerHost(
      tsConfigPath,
      {
        rootDir: this.rootDir,
        outDir: this.outDir
      },
      ts.sys,
      ts.createSemanticDiagnosticsBuilderProgram,
      (diagnostic) => console.error("Error", diagnostic.code, ":", ts.flattenDiagnosticMessageText( diagnostic.messageText, formatHost.getNewLine())),
      (diagnostic: ts.Diagnostic) => {
        // console.info(ts.formatDiagnostic(diagnostic, formatHost))
      }
    )

    const program = ts.createWatchProgram(host)

    return () => {
      program.close()
    }
  }
}
