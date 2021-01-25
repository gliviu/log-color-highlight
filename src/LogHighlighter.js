var LineHighlighter = require('./LineHighlighter');
var fs = require('fs')
var LineBoundaryTransformer = require('./LineBoundaryTransformer')


module.exports = {
    /**
     * Highlights text according to 'options' and writes output to 'output'.
     * Event emitter will send 'finished' and 'failed' when completed.
     * Options:
     * * fileName - file to read input from; if not provided, use standard input
     * * caseSensitive - force case sensitive regexp match
     * * defaultStyle - default text color
     * * highlightOptions - List of highlight options. Will be applied in the order they were specified by user.
     *                      The first element is used for default highlights (for which no color was specified). If that element is null, no default highlights are used.
     *     * patternArray - List of patterns as text
     *     * patternRegex - Regex representing concatenation of patternArray
     *     * colorText - Textual color combination
     *     * modifiers - {ci:true}
     *     * colorAnsi - {open:'ansi open codes', close:'ansi close codes'}
     */
    highlight(options, output, eventEmitter) {
        var lineBoundaryTransformer = new LineBoundaryTransformer()

        var input = getInput(options, output, eventEmitter);
        input = input.pipe(lineBoundaryTransformer);

        buildLineProcessor(input, output, eventEmitter, options.highlightOptions);
    }

}

function getInput(options, output, eventEmitter) {
    var input;
    if (options.fileName) {
        input = fs.createReadStream(options.fileName);
        input.on('error', function (event) {
            output.write("Could not open file " + options.fileName);
            eventEmitter.emit('failed');
        });
    } else {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        input = process.stdin;
    }
    return input;
}

/**
 * Highlight each input line and send it to output stream.
 */
function buildLineProcessor(input, output, eventEmitter, highlightOptions) {
    input.on('readable', function () {
        var data;
        while (data = input.read()) {
            var lines = data.toString().split('\n')
            lines.forEach(line => output.write(LineHighlighter.highlight(line, highlightOptions) + '\n'))
        }
    });

    input.on('end', function () {
        eventEmitter.emit('finished');
    });

    return input;
}
