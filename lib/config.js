"use strict";
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
        if (fs.existsSync("./" + defaltConfigFileName)) {
            file = process.cwd() + "/" + defaltConfigFileName;
        }
        else {
            var _a = process.argv, node = _a[0], entryPoint = _a[1];
            if (fs.existsSync(path_1.parse(entryPoint).dir + "/" + defaltConfigFileName)) {
                file = path_1.parse(entryPoint).dir + "/" + defaltConfigFileName;
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
    cfg.options = cfg.options || {};
    var console = cfg.options.console = cfg.options.console || { show: true, exclude: [], include: [] };
    var file = cfg.options.file = cfg.options.file || { show: true, exclude: [], include: [] };
    if (!(console.exclude instanceof Array)) {
        console.exclude = [];
    }
    if (!(console.include instanceof Array)) {
        console.include = [];
    }
    if (!(file.exclude instanceof Array)) {
        file.exclude = [];
    }
    if (!(file.include instanceof Array)) {
        file.include = [];
    }
    var create = function (regs) { return regs.map(function (reg) { return withWarn(function () { return new RegExp(reg); }); })
        .filter(function (i) { return i; }); };
    console.exclude = create(console.exclude);
    console.include = create(console.include);
    file.exclude = create(file.exclude);
    file.include = create(file.include);
}
