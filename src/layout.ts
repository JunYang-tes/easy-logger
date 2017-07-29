import { ILoggerLayoutOpt } from "./types"
import * as moment from "moment"
const ansi = require("ansi-styles")

export function simpleLayout(...arg: any[]) {
  return (layoutEvent: any) => {
    let opt: ILoggerLayoutOpt = layoutEvent.data[1]
    let level = opt.levels[layoutEvent.level.levelStr]
    let time = moment(layoutEvent.startTime).format(opt.timeFmt)
    let header = opt.layout.replace("%t", time) //     `[${time}] ${level} [${opt.name}] [${opt.position}]`
      .replace("%l", level)
      .replace("%n", opt.name)
      .replace("%p", opt.position)
    let lines = layoutEvent.data[0].split("\n")
    if (lines.length === 1) {
      return `${header} - ${lines[0]}`
    } else {
      return lines.map((line: string, idx: number) => {
        if (idx === 0) {
          return `${header} ┌─  ${line}`
        } else if (idx < lines.length - 1) {
          return `${header} │   ${line}`
        } else {
          return `${header} └─  ${line}`
        }
      }).join("\n")
    }
  }
}
