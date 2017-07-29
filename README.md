[![Build Status](https://travis-ci.org/{{github-user-name}}/{{github-app-name}}.svg?branch=master)](https://travis-ci.org/{{github-user-name}}/{{github-app-name}}.svg?branch=master)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

# Usage
```javascript
const {debug,error,warn,info } = require("b-logger")("logger.tag")
debug("debug")
error("error")
```
`debug`,`error`,`warn`,`info` are logger functions.
`logger.tag` is a name of the four functions.

```typescript
//logger function
(message:string,...params:any[])=>void
```

# Configure

`b-logger` read json and config log4js. 

+ current working directory/logger.json
+ start up script's director/logger.json

Example:

```json
{
  "level": "debug",
  "error": {
    "path": "./log/error.log",
    "fileNamePattern": "-dd"
  },
  "warn": {
    "path": "./log/warn.log",
    "fileNamePattern": "-dd"
  },
  "info": {
    "path": "./log/info.log",
    "fileNamePattern": "-dd"
  },
  "debug": {
    "path": "./log/debug.log",
    "fileNamePattern": "-dd"
  },
  "options":{
    "console":{
      "exclude":[
        ".*"
      ],
      "include":[
        "^debug"
      ]
    }
  }
  "options.dev":{

  }
}
```

pattern  <a href="https://github.com/nomiddlename/log4js-node/wiki/Date-rolling-file-appender">see here</a>


**options**



`exclude` is an array of RegExp string that used to specify which loggers will be excluded (output nothing to console)

`include` is an array of regexp string also and it was used to specify which loggers will be included.

If no `exclude` and `include` fields ,all the log will be output. 
If a logger's name matchs `exclude` and `include`, it will be included

`maxPathLength` is a number to specify the max path length on the log header. -1 is infinite.

`maxFuncNameLength` is a number to specify the max function name on the log header.
`time` is a time format ,such as `YYYY-MM-DD hh:mm:ss`

`layout` is a string to describe the log header's layout.
 + %t - time placeholder
 + %l - level placeholder
 + %n - name placeholder
 + %p - position-info placeholder

 For example, `[%t] [%n] [%p]` will be process to generate `[11:53] [test] [@anonymous -ogger/src/exp.ts:8:3]`

**options.dev**
`options.dev` has the same structure with `option` which used to overwrite `option.console` if NODE_ENV or B_LOGGER was set to `dev`