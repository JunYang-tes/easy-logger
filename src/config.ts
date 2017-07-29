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
    let paths = [`${process.cwd()}/${defaltConfigFileName}`,
    `${__dirname}/../${defaltConfigFileName}`]

    let [node, entryPoint] = process.argv
    paths.push(`${parse(entryPoint).dir}/${defaltConfigFileName}`)
    for (let p of paths) {
      if (fs.existsSync(p)) {
        file = p
        break
      }
    }
    if (file) {
      file = resolve(file)
      try {
        cfg = JSON.parse(fs.readFileSync(file).toString())
      } catch (e) {
        console.warn(`Failed to use ${file} as config file`, e)
      }
    } else {
      console.warn(`No config loaded,using default.`)
      cfg = {
        level: "debug",
        error: {
          path: "./log/error.log",
          fileNamePattern: "-dd"
        },
        warn: {
          path: "./log/warn.log",
          fileNamePattern: "-dd"
        },
        info: {
          path: "./log/info.log",
          fileNamePattern: "-dd"
        },
        debug: {
          path: "./log/debug.log",
          fileNamePattern: "-dd"
        }
      } as any
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
  let defaultValue: any = { maxPathLength: -1, show: true, exclude: [], include: [] }
  cfg.options = cfg.options || {} as any
  let consoleOpt = cfg.options.console = cfg.options.console || defaultValue
  let file = cfg.options.file = cfg.options.file || defaultValue

  type FixCond = (obj: any, field: string) => boolean
  type Fixer = (obj: any) => (field: string, action: Action) => boolean //return true if do fixed
  type Action = () => void

  const doOn = (exp: () => boolean, action: Action) => exp() ? (action(), true) : false

  const doFix = (condition: FixCond) =>
    (obj: any) =>
      (field: string, action: any) =>
        doOn(() => condition(obj, field),
          () => obj[field] = action instanceof Function ? action() : action)

  const fixWithWarn = (fix: Fixer, msg: string) =>
    (obj: any) =>
      (field: string, action: any) =>
        fix(obj)(field, action) && console.warn(`${msg} (${field})`)

  const fixMissingField = doFix((obj, field) => !(field in obj))
  const fixTypeNotArray =
    fixWithWarn(
      doFix((obj, field) => !(obj[field] instanceof Array)),
      "Need Array"
    )
  const fixTypeNotNumber =
    fixWithWarn(doFix((obj, field) => !(typeof (obj[field]) === "number")), "Need number")

  const fix = (obj: any) => {
    const fixMyMissingField = fixMissingField(obj)
    const fixMyTypeNotArray = fixTypeNotArray(obj)
    const fixMyTypeNotNumber = fixTypeNotNumber(obj)

    fixMyMissingField("include", [])
    fixMyMissingField("exclude", [])
    fixMyTypeNotArray("exclude", [])
    fixMyTypeNotArray("include", [])
    obj.exclude = create(obj.exclude)
    obj.include = create(obj.include)
    fixMyMissingField("maxPathLength", 20)
    fixMyMissingField("maxFuncNameLength", 10)
    fixMyTypeNotNumber("maxPathLength", 20)
    fixMyTypeNotNumber("maxFuncNameLength", 10)
    fixMyMissingField("time", "YYYY-MM-DD hh:mm:ss")
    fixMyMissingField("layout", "[%t] [%l] [%n] [%p]")
  }
  const create = (regs: string[]) => regs.map((reg) => withWarn(() => new RegExp(reg)))
    .filter(i => i)

  if ("options.dev" in cfg &&
    (process.env.NODE_ENV === "dev" || process.env.B_LOGGER === "dev")) {
    let devConsoleOpt = (cfg["options.dev"] as any).console || {}
    cfg.options.console = consoleOpt = {
      ...consoleOpt,
      ...devConsoleOpt
    }
  }
  fix(consoleOpt)
  fix(file)
}
