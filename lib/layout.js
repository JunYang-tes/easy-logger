"use strict";
exports.__esModule = true;
var ansi = require("ansi-styles");
var moment = require("moment");
var colors = {
    DEBUG: ansi.cyan.open + "[DEBUG]" + ansi.color.close,
    INFO: ansi.green.open + "[INFO ]" + ansi.color.close,
    WARN: ansi.yellow.open + "[WARN ]" + ansi.color.close,
    ERROR: ansi.red.open + "[ERROR]" + ansi.color.close
};
function simpleLayout() {
    var arg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arg[_i] = arguments[_i];
    }
    return function (layoutEvent) {
        var level = colors[layoutEvent.level.levelStr];
        var header = "[" + moment(layoutEvent.startTime).format("YYYY-MM-DD hh:mm:ss") + "] " + level + " [" + layoutEvent.data[1] + "]";
        var lines = layoutEvent.data[0].split("\n");
        if (lines.length === 1) {
            return header + " - " + lines[0];
        }
        else {
            return lines.map(function (line, idx) {
                if (idx === 0) {
                    return header + " \u250C\u2500  " + line;
                }
                else if (idx < lines.length - 1) {
                    return header + " \u2502   " + line;
                }
                else {
                    return header + " \u2514\u2500  " + line;
                }
            }).join("\n");
        }
    };
}
exports.simpleLayout = simpleLayout;
