var stream = require('stream');

function buildLiner(){
    var liner = new stream.Transform();

    liner._transform = function (chunk, encoding, done) {
         var data = chunk.toString();
         if (this._lastLineData) {
             data = this._lastLineData + data;
         }

         var lines = data.split('\n');
         this._lastLineData = lines.splice(lines.length-1,1)[0];

         done(null, lines.join('\n'));
    };

    liner._flush = function (done) {
         if (this._lastLineData) this.push(this._lastLineData);
         this._lastLineData = null;
         done();
    };

    return liner;
}

module.exports = buildLiner;