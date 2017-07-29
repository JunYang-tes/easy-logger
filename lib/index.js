"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
var ansi = require("ansi-styles");
var util = require("util");
var config_1 = require("./config");
var utils_1 = require("./utils");
function random(min, max) {
    return Math.random() * (max - min) + min;
}
function randColor(content) {
    var rgb = [random(0, 255) | 0, random(0, 255) | 0, random(0, 255) | 0];
    var light = random(0, 3) | 0;
    var dark = Math.random() > 0.5 ? (light + 1) % 3 : light - 1;
    if (dark === -1) {
        dark = 2;
    }
    rgb[dark] = random(0, 200) | 0;
    rgb[light] = random(200, 255) | 0;
    return (_a = ansi.color.ansi256).rgb.apply(_a, rgb) + content + ansi.color.close;
    var _a;
}
var configedLogger = null;
var config = null;
var fileLoggerCfg = null;
var consoleLoggerCfg = null;
var namespace = {};
var coloredLevels = {
    DEBUG: ansi.cyan.open + "DEBUG" + ansi.color.close,
    INFO: ansi.green.open + "INFO " + ansi.color.close,
    WARN: ansi.yellow.open + "WARN " + ansi.color.close,
    ERROR: ansi.red.open + "ERROR" + ansi.color.close
};
var levels = {
    DEBUG: "DEBUG",
    INFO: "INFO ",
    WARN: "WARN ",
    ERROR: "ERROR"
};
function loggerCreator(name) {
    if (configedLogger === null) {
        var configed = config_1.configure();
        configedLogger = configed.logger;
        config = configed.cfg;
        consoleLoggerCfg = config.options.console;
        fileLoggerCfg = config.options.file;
    }
    var colored = "";
    if (!(name in namespace)) {
        colored = randColor(name);
        namespace[name] = {
            colored: colored
        };
    }
    else {
        colored = namespace[name].colored;
    }
    return configedLogger.logFnNames.reduce(function (ret, next) {
        var include = config.options.file.include;
        var exclude = config.options.file.exclude;
        var enableFileLogger = !exclude.some(function (reg) { return reg.test(name); });
        if (include.some(function (reg) { return reg.test(name); })) {
            enableFileLogger = true;
        }
        include = config.options.console.include;
        exclude = config.options.console.exclude;
        var enableConsoleLogger = !exclude.some(function (reg) { return reg.test(name); });
        if (include.some(function (reg) { return reg.test(name); })) {
            enableConsoleLogger = true;
        }
        var opt = {
            name: name,
            levels: levels,
            timeFmt: fileLoggerCfg.time,
            layout: fileLoggerCfg.layout,
            position: ""
        };
        var opt4console = __assign({}, opt, { levels: coloredLevels, timeFmt: consoleLoggerCfg.time, layout: consoleLoggerCfg.layout, name: colored });
        ret[next] = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var msg = util.isString(message) ? message : "" + util.inspect(message);
            msg = util.format.apply(util, [msg].concat(args));
            var caller = utils_1.getCallerInfo(2);
            opt4console.position = "@" +
                utils_1.lengthCut(caller.name, consoleLoggerCfg.maxFuncNameLength) + " " +
                utils_1.lengthCut(caller.position, consoleLoggerCfg.maxPathLength);
            opt.position = "@" +
                utils_1.lengthCut(caller.name, fileLoggerCfg.maxFuncNameLength) + " " +
                utils_1.lengthCut(caller.position, fileLoggerCfg.maxPathLength);
            if (enableConsoleLogger && enableFileLogger) {
                configedLogger.fileLogger[next](msg, opt);
                configedLogger.consoleLogger[next](msg, opt4console);
            }
            else if (enableConsoleLogger) {
                configedLogger.consoleLogger[next](msg, opt4console);
            }
            else if (enableFileLogger) {
                configedLogger.fileLogger[next](msg, opt);
            }
        };
        return ret;
    }, {});
}
exports.logger = loggerCreator;
exports.logger.logger = exports.logger;
exports = module.exports = exports.logger;
