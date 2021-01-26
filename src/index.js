#!/usr/bin/env node

const CommandLineParser = require('./CommandLineParser')
const LogHighlighter = require('./LogHighlighter')
const events = require('events')

const output = process.stdout

const args = process.argv.slice(2)
const options = CommandLineParser.parseCmd(args, output)
if (!options) {
    process.exit(1)
}


const eventEmitter = new events.EventEmitter()
LogHighlighter.highlight(options, output, eventEmitter)

eventEmitter.on("finished", () => process.exit(0))
eventEmitter.on("failed", () => process.exit(1))



