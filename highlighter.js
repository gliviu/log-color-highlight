var fs = require('fs');
var ansi = require('ansi-styles');

//Receives 'color1.color2...'.
//Returns {open:'ansi open codes', close:'ansi close codes'}
function buildAnsiColor(colorsStr){
 var colorsArray = colorsStr.split('.');
 var ansiOpen = '';
 var ansiClose = '';
 for(var i=0;i<colorsArray.length;i++){
     var colorStr = colorsArray[i];
     ansiOpen+=eval('ansi.'+colorStr+'.open');
     ansiClose=eval('ansi.'+colorStr+'.close')+ansiClose;
 }
 return {open:ansiOpen, close:ansiClose};
}



/**
 * Text highlighting algorithm.
 * Iterates all highlightOptions and applies them in order such that last one will override the others.
 * For each step there is
 * a1..a2 - start/end match indexes for previous highlight option (HA) 
 * b1..b2 - start/end match indexes for previous highlight option (HB)
 * As a general rule b1-b2 takes precedence over a1-a2. Following cases are possible.
 * Case1: a1...a2...b1...b2  or b1...b2...a1...a2   
 *     Both intervals are distinct. They will be highlighted separately.
 *     HA - a1...a2
 *     HB - b1...b2 
 * Case2: b1...a1...a2...b2
 *     HA will be removed. 
 *     HB - b1...b2
 * Case3: b1...a1...b2...a2
 *     HB will override first section of HA 
 *     HB - b1...b2
 *     HA - b2...a2
 * Case4: a1...b1...a2...b2
 *     HB will override last section of HA 
 *     HB - b1...b2
 *     HA - a1...b1
 * Case5: a1...b1...b2...a2
 *     HB situated in the middle of HA. Three highlighting sections will be created: 
 *     HA - a1...b1
 *     HB - b1...b2
 *     HA - b2...a2
 *     
 */
function highlightLine(line, highlightOptions) {
    var sections = [];
    for(var i = 0; i<highlightOptions.length; i++){
        var highlightOption = highlightOptions[i];
        if(highlightOption){
            var match;
            while(match = highlightOption.patternRegex.exec(line)){
                var b2 = highlightOption.patternRegex.lastIndex-1;
                var b1 = b2-match[0].length+1;
                var j;
                for(j=0; j<sections.length; j++){
                    var section = sections[j];
                    if(section!=null){
                        var a1 = section.start;
                        var a2 = section.end;
                        if(b1<=a1 && b2>=a2){ // Case 2
                            // Remove section.
                            sections[j]=null;
                        } else if(b1<=a1 && b2>=a1 && b2<a2){ // Case 3
                            section.start = b2+1;
                        } else if(b1>a1 && b1<=a2 && b2>=a2){ // Case 4
                            section.end = b1-1;
                        } else if(b1>a1 && b2<a2){ // 5
                            sections.push({start: a1, end: b1-1, colorAnsi: sections[j].colorAnsi});
                            sections.push({start: b2+1, end: a2, colorAnsi: sections[j].colorAnsi});
                            sections[j]=null;
                        }
                    }
                }
                sections.push({start: b1, end: b2, colorAnsi: highlightOption.colorAnsi});
            }
        }
    }
    var result = [];
    var current = 0;
    
    sections.sort(function(a, b) {
        if(a===null && b===null){
            return 0;
        }
        if(a===null && b!==null){
            return 1;
        }
        if(a!==null && b===null){
            return -1;
        }
        
        return a.start - b.start;
    });
    
    for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        if(section){
            result.push(line.substr(current, section.start-current));
            result.push(section.colorAnsi.open);
            result.push(line.substr(section.start, section.end-section.start+1));
            result.push(section.colorAnsi.close);
            current = section.end+1;
        } else{
            break;
        }
    }
    result.push(line.substr(current, line.length-current));
    
    return result.join('');
}

function buildLiner(writer, eventEmitter, highlightOptions) {
    var liner = require('./liner')();

    liner.on('readable', function () {
        var line;
        while (line = liner.read()) {
            writer.write(highlightLine(line, highlightOptions)+'\n');
        }
    });
    liner.on('end', function () {
        eventEmitter.emit('finished');
    });

    return liner;
}

function buildColorFromText(highlightColorArg, defaultStyle){
    var colorsText = highlightColorArg.split('.');
    var colorStr = defaultStyle;
    for(var i=0; i<colorsText.length; i++){
        var colorText = colorsText[i];
        if(colorStr.length>0){
            colorStr += '.';
        }
        colorStr += colorText;
    }
    return buildAnsiColor(colorStr);
}

/**
 * Highlights text according to 'options' and writes output to 'writer'.
 * Event emitter will send 'finished' and 'failed' when completed.
 * Options:
 * highlightOptions
 *      List of highlight options. Will be applied in the order they were specified by user.
 *      The first element is used for default highlights (for which no color was specified). If that element is null, no default highlights are used. 
 *      Item format:
 *      {
 *          "patternArray": List of patterns as text
 *          "patternRegex": Regex representing concatenation of patternArray 
 *          "colorText": Textual color combination
 *          "modifiers": {ci:true}
 *          "colorAnsi": {open:'ansi open codes', close:'ansi close codes'}
 *      },
 * }
 *
 */
function highlight(options, writer, eventEmitter) {
    // Transform highlight pattern into valid regexp.
    for(var i=0; i<options.highlightOptions.length; i++){
        var highlightOption = options.highlightOptions[i];
        if(highlightOption){
            // Regex case option
            var caseOption = options.caseSensitive?'':'i'; // Case sensitive is default regex option
            if(highlightOption.modifiers['cs']){
                caseOption = '';
            }
            if(highlightOption.modifiers['ci']){
                caseOption = 'i';
            }
            var shouldEscape = highlightOption.modifiers['esc']===true;
            
            // Cache pattern as regex.
            var patternListStr = '';
            for (var j = highlightOption.patternArray.length-1; j >= 0 ; j--) { // Iterate in reverse order because we want that last pattern to override the previous.
                if(patternListStr.length>0){
                    patternListStr+='|';
                }
                if(shouldEscape){
                    patternListStr+= escapeRegExp(highlightOption.patternArray[j]);
                } else{
                    patternListStr+=highlightOption.patternArray[j];
                }
            }
            highlightOption.patternRegex = new RegExp(patternListStr, 'g'+caseOption);

            // Cache color
            highlightOption.colorAnsi = buildColorFromText(highlightOption.colorText, options.defaultStyle);
        }
        
    }

//    console.log(JSON.stringify(options.highlightOptions, null, 2));
        
    var liner = buildLiner(writer, eventEmitter, options.highlightOptions);
    if (options.fileName) {
        var source = fs.createReadStream(options.fileName);
        source.on('error', function (event) {
            writer.write("Could not open file "+options.fileName);
            eventEmitter.emit('failed');
        });
        source.pipe(liner);
    } else {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.pipe(liner);
    }
    
    return;
}

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string){
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = highlight;


