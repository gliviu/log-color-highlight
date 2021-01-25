#!/usr/bin/env node

var CommandLineParser = require('./CommandLineParser');
var LogHighlighter = require('./LogHighlighter')
var events = require('events');

var output = process.stdout;

var args = process.argv.slice(2);
var options = CommandLineParser.parseCmd(args, output);
if (!options) {
    process.exit(1);
}


var eventEmitter = new events.EventEmitter();
LogHighlighter.highlight(options, output, eventEmitter);

eventEmitter.on("finished", function () {
    process.exit(0);
});
eventEmitter.on("failed", function () {
    process.exit(1);
});



