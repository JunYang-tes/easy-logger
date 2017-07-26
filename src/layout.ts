const ansi = require("ansi-styles")
import * as moment from "moment"

const colors: any = {
  DEBUG: `${ansi.cyan.open}[DEBUG]${ansi.color.close}`,
  INFO: `${ansi.green.open}[INFO ]${ansi.color.close}`,
  WARN: `${ansi.yellow.open}[WARN ]${ansi.color.close}`,
  ERROR: `${ansi.red.open}[ERROR]${ansi.color.close}`,
}
export function simpleLayout(...arg: any[]) {
  return (layoutEvent: any) => {
    let level = colors[layoutEvent.level.levelStr]
    let header = `[${moment(layoutEvent.startTime).format("YYYY-MM-DD hh:mm:ss")}] ${level} [${layoutEvent.data[1]}]`
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
