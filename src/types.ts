export type LoggerFn = (message: string, ...params: any[]) => void
export interface ILogger {
  logFnNames: string[],
  fileLogger?: {
    [level: string]: LoggerFn
  }
  consoleLogger: {
    [level: string]: LoggerFn
  }
}
export interface ILoggerOption {
  show: boolean,
  exclude?: RegExp[] | string[],
  include?: RegExp[] | string[]
}
export type ICfg = {
  [name: string]: {
    path: string,
    filenamePattern: string
  }
} & { level: string } & {
    options: {
      console: ILoggerOption,
      file: ILoggerOption
    }
  }
