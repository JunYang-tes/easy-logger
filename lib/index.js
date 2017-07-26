"use strict";
exports.__esModule = true;
var ansi = require("ansi-styles");
var util = require("util");
var config_1 = require("./config");
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
var namespace = {};
function loggerCreator(name) {
    if (configedLogger === null) {
        var configed = config_1.configure();
        configedLogger = configed.logger;
        config = configed.cfg;
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
        if (enableConsoleLogger && enableFileLogger) {
            ret[next] = function (message) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                var msg = util.isString(message) ? message : "" + util.inspect(message);
                msg = util.format.apply(util, [msg].concat(args));
                configedLogger.fileLogger[next](msg, name);
                configedLogger.consoleLogger[next](msg, colored);
            };
        }
        else if (enableConsoleLogger) {
            ret[next] = function (message) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                var msg = util.isString(message) ? message : "" + util.inspect(message);
                msg = util.format.apply(util, [msg].concat(args));
                configedLogger.consoleLogger[next](msg, colored);
            };
        }
        else if (enableFileLogger) {
            ret[next] = function (message) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                var msg = util.isString(message) ? message : "" + util.inspect(message);
                msg = util.format.apply(util, [msg].concat(args));
                configedLogger.fileLogger[next](msg, name);
            };
        }
        else {
            ret[next] = function () { };
        }
        return ret;
    }, {});
}
exports.logger = loggerCreator;
exports.logger.logger = exports.logger;
exports = module.exports = exports.logger;
