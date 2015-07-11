var fs = require('fs');
var stringArgv = require('./string-argv');

var LINE_COMMENT_REGEX = /^#+.*$/m;

/**
 * Builds arguments based on config file 
 */
function buildConfigArgument(configFilePath){
    var args = [];
    require('fs').readFileSync(configFilePath).toString().split('\n').forEach(function (line) { processConfigLine(line, args); });
    return args;
}

function processConfigLine(line, args){
    if(LINE_COMMENT_REGEX.test(line)){
        // Ignore commments
        return;
    }
    
    args.push.apply(args, stringArgv.parseArgsStringToArgv(line));
}



module.exports = buildConfigArgument;

