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
var log4js = require("log4js");
var layout_1 = require("./layout");
var path_1 = require("path");
var fs = require("fs");
log4js.layouts.addLayout("simple", layout_1.simpleLayout);
var log4jcfg = {
    appenders: [
        {
            type: "stdout",
            category: "stdout",
            layout: {
                type: "simple"
            }
        }
    ]
};
function config(cfg, dir) {
    var logFn = ["error", "warn", "info", "debug"];
    if (cfg && logFn.indexOf(cfg.level.toLocaleLowerCase()) >= 0) {
        logFn.slice(0, logFn.indexOf(cfg.level) + 1)
            .forEach(function (level) {
            var path = "" + cfg[level].path;
            log4jcfg.appenders.push({
                type: "dateFile",
                level: level.toUpperCase(),
                filename: path,
                alwaysIncludePattern: false,
                layout: {
                    type: "simple"
                },
                category: level
            });
        });
    }
    log4js.configure(log4jcfg);
    var clogger = log4js.getLogger("stdout");
    var loggers = {
        logFnNames: logFn,
        fileLogger: logFn.reduce(function (ret, logerName) {
            var logger = log4js.getLogger(logerName);
            ret[logerName] = logger[logerName].bind(logger);
            return ret;
        }, {}),
        consoleLogger: logFn.reduce(function (ret, next) { return (ret[next] = clogger[next].bind(clogger), ret); }, {})
    };
    return loggers;
}
var defaltConfigFileName = "logger.json";
function configure(cfg) {
    var baseDir = "";
    if (!cfg) {
        var file = "";
        var paths = [process.cwd() + "/" + defaltConfigFileName,
            __dirname + "/../" + defaltConfigFileName];
        var _a = process.argv, node = _a[0], entryPoint = _a[1];
        paths.push(path_1.parse(entryPoint).dir + "/" + defaltConfigFileName);
        for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
            var p = paths_1[_i];
            if (fs.existsSync(p)) {
                file = p;
                break;
            }
        }
        if (file) {
            file = path_1.resolve(file);
            try {
                cfg = JSON.parse(fs.readFileSync(file).toString());
            }
            catch (e) {
                console.warn("Failed to use " + file + " as config file", e);
            }
        }
        else {
            console.warn("No config loaded,using default.");
            cfg = {
                level: "debug",
                error: {
                    path: "./log/error.log",
                    fileNamePattern: "-dd"
                },
                warn: {
                    path: "./log/warn.log",
                    fileNamePattern: "-dd"
                },
                info: {
                    path: "./log/info.log",
                    fileNamePattern: "-dd"
                },
                debug: {
                    path: "./log/debug.log",
                    fileNamePattern: "-dd"
                }
            };
        }
    }
    fixCfg(cfg);
    return { logger: config(cfg, baseDir), cfg: cfg };
}
exports.configure = configure;
function withWarn(op) {
    try {
        return op();
    }
    catch (e) {
        console.warn(e);
    }
}
function fixCfg(cfg) {
    var defaultValue = { maxPathLength: -1, show: true, exclude: [], include: [] };
    cfg.options = cfg.options || {};
    var consoleOpt = cfg.options.console = cfg.options.console || defaultValue;
    var file = cfg.options.file = cfg.options.file || defaultValue;
    var doOn = function (exp, action) { return exp() ? (action(), true) : false; };
    var doFix = function (condition) {
        return function (obj) {
            return function (field, action) {
                return doOn(function () { return condition(obj, field); }, function () { return obj[field] = action instanceof Function ? action() : action; });
            };
        };
    };
    var fixWithWarn = function (fix, msg) {
        return function (obj) {
            return function (field, action) {
                return fix(obj)(field, action) && console.warn(msg + " (" + field + ")");
            };
        };
    };
    var fixMissingField = doFix(function (obj, field) { return !(field in obj); });
    var fixTypeNotArray = fixWithWarn(doFix(function (obj, field) { return !(obj[field] instanceof Array); }), "Need Array");
    var fixTypeNotNumber = fixWithWarn(doFix(function (obj, field) { return !(typeof (obj[field]) === "number"); }), "Need number");
    var fix = function (obj) {
        var fixMyMissingField = fixMissingField(obj);
        var fixMyTypeNotArray = fixTypeNotArray(obj);
        var fixMyTypeNotNumber = fixTypeNotNumber(obj);
        fixMyMissingField("include", []);
        fixMyMissingField("exclude", []);
        fixMyTypeNotArray("exclude", []);
        fixMyTypeNotArray("include", []);
        obj.exclude = create(obj.exclude);
        obj.include = create(obj.include);
        fixMyMissingField("maxPathLength", 20);
        fixMyMissingField("maxFuncNameLength", 10);
        fixMyTypeNotNumber("maxPathLength", 20);
        fixMyTypeNotNumber("maxFuncNameLength", 10);
        fixMyMissingField("time", "YYYY-MM-DD hh:mm:ss");
        fixMyMissingField("layout", "[%t] [%l] [%n] [%p]");
    };
    var create = function (regs) { return regs.map(function (reg) { return withWarn(function () { return new RegExp(reg); }); })
        .filter(function (i) { return i; }); };
    if ("options.dev" in cfg &&
        (process.env.NODE_ENV === "dev" || process.env.B_LOGGER === "dev")) {
        var devConsoleOpt = cfg["options.dev"].console || {};
        cfg.options.console = consoleOpt = __assign({}, consoleOpt, devConsoleOpt);
    }
    fix(consoleOpt);
    fix(file);
}
