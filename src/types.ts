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
  maxPathLength: number,
  maxFuncNameLength: number,
  time: string,
  layout: string,
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
export interface ILoggerLayoutOpt {
  name: string,
  levels: { [name: string]: string },
  position: string,
  timeFmt: string,
  layout: string,
}
