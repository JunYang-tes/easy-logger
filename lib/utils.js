"use strict";
exports.__esModule = true;
function getCallerInfo(idx) {
    if (idx === void 0) { idx = 1; }
    var name = "Unknow";
    var stack = new Error().stack.split("\n");
    var position = "";
    if (stack.length > idx + 1) {
        var line = stack[idx + 1];
        if (line.indexOf("(") >= 0) {
            var caller = /\s*at\s*([^\(]+)/.exec(line);
            if (caller) {
                name = caller[1].trim();
            }
            var p = /\(([^\(]+)\)/.exec(line);
            if (p) {
                position = p[1].trim();
            }
        }
        else {
            name = "anonymous";
            position = line.replace(/\s*at\s*/, "");
        }
    }
    return {
        name: name,
        position: position
    };
}
exports.getCallerInfo = getCallerInfo;
function lengthCut(value, max) {
    if (max < 0 || value.length <= max) {
        return value;
    }
    return "-" + value.slice(-Math.abs(max));
}
exports.lengthCut = lengthCut;
