import { logger } from "./index"

import { LoggerFn } from "./types"
(() => {
  console.log("test")
  let { debug, error, info, warn } = logger("test")
  debug("test")
  error("test")
  info("test")
  warn("test")
})()
  ;
(() => {
  console.log("1test")
  let { debug, error, info, warn } = logger("1test")
  debug("test")
  error("test")
  info("test")
  warn("test")
  function aFunctionWithloooooooooogName() {
    debug("bala")
  }
  aFunctionWithloooooooooogName()
})()
