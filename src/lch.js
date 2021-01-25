#!/usr/bin/env node

var parseCmd = require('./parseCmd');
var highlight = require('./highlighter');
var events = require('events');

var writer = process.stdout;

var args = process.argv.slice(2);
var options = parseCmd(args, writer);
if (!options) {
    process.exit(1);
}


var eventEmitter = new events.EventEmitter();
setImmediate(function () {
    highlight(options, writer, eventEmitter);
});
eventEmitter.on("finished", function () {
    process.exit(0);
});
eventEmitter.on("failed", function () {
    process.exit(1);
});
