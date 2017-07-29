"use strict";
exports.__esModule = true;
var moment = require("moment");
var ansi = require("ansi-styles");
function simpleLayout() {
    var arg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arg[_i] = arguments[_i];
    }
    return function (layoutEvent) {
        var opt = layoutEvent.data[1];
        var level = opt.levels[layoutEvent.level.levelStr];
        var time = moment(layoutEvent.startTime).format(opt.timeFmt);
        var header = opt.layout.replace("%t", time)
            .replace("%l", level)
            .replace("%n", opt.name)
            .replace("%p", opt.position);
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
