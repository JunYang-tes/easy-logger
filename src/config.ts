const log4js: any = require("log4js")
import { simpleLayout } from "./layout"
import { ILogger, ICfg } from "./types"
import { parse, resolve } from "path"
import * as fs from "fs"
log4js.layouts.addLayout("simple", simpleLayout)
const log4jcfg: { appenders: any[] } = {
  appenders: [
    {
      type: "stdout",
      category: "stdout",
      layout: {
        type: "simple"
      }
    }
  ]
}

function config(cfg?: ICfg, dir?: string): ILogger {
  const logFn = ["error", "warn", "info", "debug"]
  //configure log4js
  if (cfg && logFn.indexOf(cfg.level.toLocaleLowerCase()) >= 0) {
    logFn.slice(0, logFn.indexOf(cfg.level) + 1)
      .forEach((level: string) => {
        let path = `${cfg[level].path}`
        log4jcfg.appenders.push({
          type: "dateFile",
          level: level.toUpperCase(),
          filename: path,
          alwaysIncludePattern: false,
          layout: {
            type: "simple"
          },
          category: level
        })
      })
  }

  log4js.configure(log4jcfg)
  const clogger = log4js.getLogger("stdout")
  const loggers = {
    logFnNames: logFn,
    // for example: log4js.getLogger("info").info.bind(log4js.getLogger("info"))
    fileLogger: logFn.reduce((ret: any, logerName) => {
      let logger = log4js.getLogger(logerName)
      ret[logerName] = logger[logerName].bind(logger)
      return ret
    }, {}),
    consoleLogger: logFn.reduce((ret: any, next) => (ret[next] = clogger[next].bind(clogger), ret), {})
  }

  return loggers
}
const defaltConfigFileName = "logger.json"
export function configure(cfg?: ICfg): { logger: ILogger, cfg: ICfg } {
  let baseDir = ""
  if (!cfg) {
    let file = ""
    if (fs.existsSync(`./${defaltConfigFileName}`)) {
      file = `${process.cwd()}/${defaltConfigFileName}`
    } else {
      let [node, entryPoint] = process.argv
      if (fs.existsSync(`${parse(entryPoint).dir}/${defaltConfigFileName}`)) {
        file = `${parse(entryPoint).dir}/${defaltConfigFileName}`
      }
    }
    if (file) {
      file = resolve(file)
      try {
        cfg = JSON.parse(fs.readFileSync(file).toString())
      } catch (e) {
        console.warn(`Failed to use ${file} as config file`, e)
      }
    }
  }
  fixCfg(cfg)
  return { logger: config(cfg, baseDir), cfg }
}
function withWarn(op: () => any) {
  try {
    return op()
  } catch (e) {
    console.warn(e)
  }
}
function fixCfg(cfg: ICfg) {
  cfg.options = cfg.options || {} as any
  let console = cfg.options.console = cfg.options.console || { show: true, exclude: [], include: [] } as any
  let file = cfg.options.file = cfg.options.file || { show: true, exclude: [], include: [] } as any
  if (!(console.exclude instanceof Array)) {
    console.exclude = []
  }
  if (!(console.include instanceof Array)) {
    console.include = []
  }
  if (!(file.exclude instanceof Array)) {
    file.exclude = []
  }
  if (!(file.include instanceof Array)) {
    file.include = []
  }

  const create = (regs: string[]) => regs.map((reg) => withWarn(() => new RegExp(reg)))
    .filter(i => i)

  console.exclude = create(console.exclude)
  console.include = create(console.include)
  file.exclude = create(file.exclude)
  file.include = create(file.include)
}
