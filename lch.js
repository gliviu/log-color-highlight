#!/usr/bin/env node

var events = require('events');
var execute = require('./index');

var args = process.argv.slice(2);

var eventEmitter = new events.EventEmitter();

setImmediate(function(){
    execute(args, process.stdout, eventEmitter);
});
eventEmitter.on("finished", function(){
    process.exit(0);
});
eventEmitter.on("failed", function(){
    process.exit(1);
});
