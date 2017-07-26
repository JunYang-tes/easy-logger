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
}
```

pattern  <a href="https://github.com/nomiddlename/log4js-node/wiki/Date-rolling-file-appender">see here</a>


**options**

There are two fields in options at the monent,`console` and `file` represent two types of logger.

`exclude` is an array of RegExp string that used to specify which loggers will be excluded (output nothing to console)
`include` is an array of regexp string also and it was used to specify which loggers will be included.

If no `exclude` and `include` fields ,all the log will be output. 
If a logger's name matchs `exclude` and `include`, it will be included