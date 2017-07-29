const ansi = require("ansi-styles")
import * as util from "util"
import { LoggerFn, ICfg, ILogger, ILoggerLayoutOpt, ILoggerOption } from "./types"
import { configure } from "./config"
import { getCallerInfo, lengthCut } from "./utils"

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}
function randColor(content: string) {
  let rgb = [random(0, 255) | 0, random(0, 255) | 0, random(0, 255) | 0]
  let light = random(0, 3) | 0
  let dark = Math.random() > 0.5 ? (light + 1) % 3 : light - 1
  if (dark === -1) {
    dark = 2
  }
  rgb[dark] = random(0, 200) | 0
  rgb[light] = random(200, 255) | 0
  return ansi.color.ansi256.rgb(...rgb) + content + ansi.color.close
}
let configedLogger: ILogger = null
let config: ICfg = null
let fileLoggerCfg: ILoggerOption = null
let consoleLoggerCfg: ILoggerOption = null
const namespace: {
  [name: string]: {
    colored: string
  }
} = {}
export interface ILoggerCreator {
  (name: string): {
    debug: LoggerFn,
    info: LoggerFn,
    error: LoggerFn,
    warn: LoggerFn
  }
  logger: ILoggerCreator
}
const coloredLevels: any = {
  DEBUG: `${ansi.cyan.open}DEBUG${ansi.color.close}`,
  INFO: `${ansi.green.open}INFO ${ansi.color.close}`,
  WARN: `${ansi.yellow.open}WARN ${ansi.color.close}`,
  ERROR: `${ansi.red.open}ERROR${ansi.color.close}`,
}
const levels: any = {
  DEBUG: "DEBUG",
  INFO: "INFO ",
  WARN: "WARN ",
  ERROR: "ERROR",
}

function loggerCreator(name: string): {
  debug: LoggerFn,
  info: LoggerFn,
  error: LoggerFn,
  warn: LoggerFn
} {
  if (configedLogger === null) {
    let configed = configure()
    configedLogger = configed.logger
    config = configed.cfg
    consoleLoggerCfg = config.options.console
    fileLoggerCfg = config.options.file
  }

  let colored = ""
  if (!(name in namespace)) {
    colored = randColor(name)
    namespace[name] = {
      colored
    }
  } else {
    colored = namespace[name].colored
  }
  /**
   * {
   *    error:function(message,argument)
   *    info
   *    warn
   *    ...
   * }
   */
  return configedLogger.logFnNames.reduce((ret: any, next) => {

    let include: RegExp[] = config.options.file.include as RegExp[]
    let exclude: RegExp[] = config.options.file.exclude as RegExp[]

    let enableFileLogger =
      !exclude.some((reg: RegExp) => reg.test(name))
    if (include.some(reg => reg.test(name))) {
      enableFileLogger = true
    }

    include = config.options.console.include as RegExp[]
    exclude = config.options.console.exclude as RegExp[]

    let enableConsoleLogger =
      !exclude.some((reg: RegExp) => reg.test(name))
    if (include.some(reg => reg.test(name))) {
      enableConsoleLogger = true
    }
    let opt: ILoggerLayoutOpt = {
      name,
      levels,
      timeFmt: fileLoggerCfg.time,
      layout: fileLoggerCfg.layout,
      position: "",
    }
    let opt4console: ILoggerLayoutOpt = {
      ...opt,
      levels: coloredLevels,
      timeFmt: consoleLoggerCfg.time,
      layout: consoleLoggerCfg.layout,
      name: colored
    }

    ret[next] = (message: string, ...args: any[]) => {
      let msg = util.isString(message) ? message : `${util.inspect(message)}`
      msg = util.format(msg, ...args)
      let caller = getCallerInfo(2)
      opt4console.position = "@" +
        lengthCut(caller.name, consoleLoggerCfg.maxFuncNameLength) + " " +
        lengthCut(caller.position, consoleLoggerCfg.maxPathLength)
      opt.position = "@" +
        lengthCut(caller.name, fileLoggerCfg.maxFuncNameLength) + " " +
        lengthCut(caller.position, fileLoggerCfg.maxPathLength)

      if (enableConsoleLogger && enableFileLogger) {
        configedLogger.fileLogger[next](msg, opt)
        configedLogger.consoleLogger[next](msg, opt4console)
      } else if (enableConsoleLogger) {
        configedLogger.consoleLogger[next](msg, opt4console)
      } else if (enableFileLogger) {
        configedLogger.fileLogger[next](msg, opt)
      }
    }
    return ret
  }, {})
}

export const logger: ILoggerCreator = loggerCreator as any
logger.logger = logger
exports = module.exports = logger
