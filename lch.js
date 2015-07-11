#!/usr/bin/env node

var execute = require('./index');

var args = process.argv.slice(2);

execute(args, process.stdout);