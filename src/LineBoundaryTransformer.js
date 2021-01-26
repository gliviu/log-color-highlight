const stream = require('stream')

/**
 * Makes sure stream processing occurs only at line boundary.
 * That means the output of this transformer will contain chunks 
 * that never start or end in the middle of a line.
 */
module.exports = class LineBoundaryTransformer extends stream.Transform {
    _lastLineData = ''
    constructor(options) {
        super(options)
    }

    _transform(chunk, encoding, done) {
        let data = chunk.toString()
        if (this._lastLineData) {
            data = this._lastLineData + data
        }

        const lines = data.split('\n')
        this._lastLineData = lines.splice(lines.length - 1, 1)[0]

        done(null, lines.join('\n'))
    }

    _flush(done) {
        if (this._lastLineData) this.push(this._lastLineData)
        this._lastLineData = null
        done()
    }
}