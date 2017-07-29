"use strict";
exports.__esModule = true;
var index_1 = require("./index");
(function () {
    console.log("test");
    var _a = index_1.logger("test"), debug = _a.debug, error = _a.error, info = _a.info, warn = _a.warn;
    debug("test");
    error("test");
    info("test");
    warn("test");
})();
(function () {
    console.log("1test");
    var _a = index_1.logger("1test"), debug = _a.debug, error = _a.error, info = _a.info, warn = _a.warn;
    debug("test");
    error("test");
    info("test");
    warn("test");
    function aFunctionWithloooooooooogName() {
        debug("bala");
    }
    aFunctionWithloooooooooogName();
})();
