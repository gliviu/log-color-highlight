const fs = require('fs')
const stringArgv = require('string-argv')

const LINE_COMMENT_REGEX = /^#+.*$/m



module.exports = {
    /**
     * Builds arguments based on config file
     */
    buildConfigArgument(configFilePath) {
        const args = []
        fs.readFileSync(configFilePath).toString().split('\n').forEach(line => processConfigLine(line, args))
        return args
    }
}

function processConfigLine(line, args) {
    if (LINE_COMMENT_REGEX.test(line)) {
        // Ignore commments
        return
    }

    args.push.apply(args, stringArgv.parseArgsStringToArgv(line))
}




