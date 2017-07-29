import { LoggerFn } from "./types"
export function getCallerInfo(idx: number = 1) {
  let name = "Unknow"
  let stack = new Error().stack.split("\n")
  let position = ""
  if (stack.length > idx + 1) {
    let line = stack[idx + 1]
    if (line.indexOf("(") >= 0) {
      let caller = /\s*at\s*([^\(]+)/.exec(line)
      if (caller) {
        name = caller[1].trim()
      }
      let p = /\(([^\(]+)\)/.exec(line)
      if (p) {
        position = p[1].trim()
      }
    } else {
      name = "anonymous"
      position = line.replace(/\s*at\s*/, "")
    }
  }
  return {
    name,
    position
  }
}
export function lengthCut(value: string, max: number) {
  if (max < 0 || value.length <= max) {
    return value
  }
  return "-" + value.slice(-Math.abs(max))
}
