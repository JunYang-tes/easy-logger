const ansi = require("ansi-styles")
import * as util from "util"
import { LoggerFn, ICfg, ILogger } from "./types"
import { configure } from "./config"

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

    if (enableConsoleLogger && enableFileLogger) {
      ret[next] = (message: string, ...args: any[]) => {
        let msg = util.isString(message) ? message : `${util.inspect(message)}`
        msg = util.format(msg, ...args)
        configedLogger.fileLogger[next](msg, name)
        configedLogger.consoleLogger[next](msg, colored)
      }
    } else if (enableConsoleLogger) {
      ret[next] = (message: string, ...args: any[]) => {
        let msg = util.isString(message) ? message : `${util.inspect(message)}`
        msg = util.format(msg, ...args)
        configedLogger.consoleLogger[next](msg, colored)
      }
    } else if (enableFileLogger) {
      ret[next] = (message: string, ...args: any[]) => {
        let msg = util.isString(message) ? message : `${util.inspect(message)}`
        msg = util.format(msg, ...args)
        configedLogger.fileLogger[next](msg, name)
      }
    } else {
      ret[next] = () => { }
    }

    return ret
  }, {})
}

export const logger: ILoggerCreator = loggerCreator as any
logger.logger = logger
exports = module.exports = logger
