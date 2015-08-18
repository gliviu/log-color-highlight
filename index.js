var ansi = require('ansi-styles');
var fs = require('fs');
var events = require('events');
var pjson = require('./package.json');

var DEFAULT_HIGHLIGHT_COLOR = 'red'; // If no color is specified, use red.
var DEFAULT_HIGHLIGHT_COLOR_PARAM = 'DEFAULT_HIGHLIGHT_COLOR_PARAM';
var NO_LINE_START_REGEX = /^[^\-].*$/; // Text that does not start with a dash.
var LINE_START_REGEX = /^-.*$/;


var validModifiers = {
        'ci' : true, // case insensitive
        'cs' : true, // case sensitive
};

var validColors = {
        'black' : true,
        'red' : true,
        'green' : true,
        'yellow' : true,
        'blue' : true,
        'magenta' : true,
        'cyan' : true,
        'white' : true,
        'gray' : true,
};

var validBgColors = {
        'bgBlack' : true,
        'bgRed' : true,
        'bgGreen' : true,
        'bgYellow' : true,
        'bgBlue' : true,
        'bgMagenta' : true,
        'bgCyan' : true,
        'bgWhite' : true,
};

var validStyles = {
        'reset' : true,
        'bold' : true,
        'dim' : true,
        'italic' : true,
        'underline' : true,
        'inverse' : true,
        'hidden' : true,
        'strikethrough' : true,
};

var argFile;  // -f 
var argConfig; // -c
var argCaseSensitive; // -cs
var argDefaultStyle; // -s
var argHelp; // --h, --help

// List of highlight options. Will be applied in the order they were specified by user.
// The first element is used for default highlights (for which no color was specified). If that element is null, no default highlights are used. 
// Item format:
//  {
//    "patternArray": List of patterns as text
//    "patternRegex": Regex representing concatenation of patternArray 
//    "colorText": Textual color combination
//    "modifiers": {ci:true}
//    "colorAnsi": {open:'ansi open codes', close:'ansi close codes'}
//  },
// }
var highlightOptions;

function error(message){
    return ansi.red.open+ansi.bold.open+message+ansi.bold.close+ansi.red.close;
}
function bold(message){
    return ansi.bold.open+message+ansi.bold.close;
}
function gray(message){
    return ansi.gray.open+message+ansi.gray.close;
}

function printHelp () {
    console.log("  log-color-highlight v"+pjson.version);

    console.log(bold("  Usage:")+" lch [options] Highlight pattern");
    console.log("");
    
    console.log(bold("  Options:"));
    console.log("\t-f filePath\tInput file path. If this is not provided, standard input is used.");
    console.log("\t-c configPath\tPath to configuration file. See "+bold("Highlight pattern")+" below.");
    console.log("\t-s style\tImplicit style. See "+gray('Styles')+" below for valid value.");
    console.log("\t-cs\t\tCase sensitive. By default text matching is done case insensitive.");
    console.log("\t-h --help\tPrints this help message.");
    console.log("");
    
    console.log(bold("  Highlight pattern:")+" [pattern1 pattern2 ...] [-color pattern1 pattern2 ...] ....");
    console.log("\tpattern\tRegex pattern. If no color is specified, by default it is highlighted in Red.");
    console.log("\tcolor\tHighlighting color, style or modifier. Allowed values:");
    process.stdout.write(gray("\t\tColors:"));
    for(var color in validColors){
        process.stdout.write(" "+color);
    }
    process.stdout.write(gray("\n\t\tBackground colors:"));
    for(var color in validBgColors){
        process.stdout.write(" "+color);
    }
    process.stdout.write(gray("\n\t\tStyles:"));
    for(var color in validStyles){
        process.stdout.write(" "+color);
    }
    process.stdout.write(gray("\n\t\tModifiers:"));
    process.stdout.write(" cs ci (toggle for case sensitivity)");
    console.log('');
    console.log('');
    
    console.log(bold("  Examples:"));
    console.log("\ttail -f file | lch error warn");
    console.log("\ttail -f file | lch -cs ERROR WARN");
    console.log("\ttail -f file | lch -red error -yellow warn");
    console.log("\tMore samples at https://www.npmjs.com/package/log-color-highlight#examples");
}

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


function addHighlightPattern (highlightColor, modifiers, highlightPatternArray) {
    var i;
    if(highlightColor===DEFAULT_HIGHLIGHT_COLOR_PARAM){
        if(highlightOptions[0]===null){
            highlightOptions[0] = {colorText: null, patternArray: [], pattern: null, color: null, modifiers: {}};
        }
        i=0;
        highlightOptions[0].colorText = DEFAULT_HIGHLIGHT_COLOR;
    } else{
        highlightOptions.push({colorText: null, patternArray: [], pattern: null, color: null, modifiers: modifiers});
        i = highlightOptions.length-1;
        highlightOptions[i].colorText = highlightColor;
    }
    
    highlightOptions[i].patternArray = highlightOptions[i].patternArray.concat(highlightPatternArray);
}

function validateAndBuildColor(colorTextParam){
    var colorText = '';
    var modifiers = {};
    var colorTextArray = colorTextParam.split('.');
    for(var i=0; i<colorTextArray.length; i++){
        var subcolorText = colorTextArray[i];
        var validColor = validColors[subcolorText];
        var validStyle = validStyles[subcolorText];
        var validBgColor = validBgColors[subcolorText];
        var validModifier = validModifiers[subcolorText];
        if(!(validColor || validStyle || validBgColor || validModifier)){
            return false;
        }
        
        if(validModifier){
            modifiers[subcolorText] = true;
        } else{
            if(colorText!==''){
                colorText+='.';
            }
            colorText+=subcolorText;
        }
    }
    return {colorText: colorText, modifiers: modifiers};
}

function validateAndBuildOptions (args) {
    if(args.length==0){
        return error("No options specified");
    }
    
    for (var i = 0; i < args.length;) {
        var arg1 = args[i];
        var arg2 = null;
        if (i < args.length - 1) {
            arg2 = args[i + 1];
        }

        if (arg1 === '-f') {
            if (arg2 == null) {
                return error("Input file path required.");
            }
            argFile = arg2;
            i += 2;
            continue;
        }
        if (arg1 === '-c') {
            if (arg2 == null) {
                return error("Config file path required.");
            }
            argConfig = arg2;
            
            var buildConfigArgument = require('./config'); 
            var configArgs = buildConfigArgument(argConfig);
            var optionsResult = validateAndBuildOptions(configArgs);
            if (optionsResult!==true) {
                return error('Error in config file: '+optionsResult);
            }
            
            i += 2;
            continue;
        }
        if (arg1 === '-cs') {
            argCaseSensitive = true;
            i++;
            continue;
        }
        if (arg1 === '-s') {
            if (arg2 == null) {
                return error("Default style required for '"+arg1+"'.");
            }
            var colorInfo = validateAndBuildColor(arg2);
            if(colorInfo===false){
                return error("Default style '"+arg2+"' is not valid.");
            }
            argDefaultStyle = colorInfo.colorText;
            i+=2;
            continue;
        }
        if (arg1 === '-h' || arg1 === '--help') {
            argHelp = true;
            i++;
            continue;
        }

        // Default color highlight pattern.
        if (NO_LINE_START_REGEX.test(arg1)) {
            addHighlightPattern(DEFAULT_HIGHLIGHT_COLOR_PARAM, {}, [arg1]);
            i++;
            continue;
        }
        
        // Specified color
        if (LINE_START_REGEX.test(arg1)) {
            var colorText = arg1.substring(1); // strip leading dash
            colorText = colorText.toLowerCase(); // normalize
            colorText = colorText.replace( // upercase third letter for background colors (ie. bgGreen)
                    /(bg)(.)((.*?\.)|(.*))/gi, 
                    function (c0, c1, c2, c3) {
                        return c1.toLowerCase() + c2.toUpperCase() + c3.toLowerCase();
                    });

            var colorInfo = validateAndBuildColor(colorText);
            if(colorInfo===false){
                return error("Wrong option: '"+arg1+"'");
            }
            colorText = colorInfo.colorText;
            // Get all following arguments
            var patternsArray = [];
            for (var j = i+1; j < args.length; j++) {
                var arg = args[j];
                if (NO_LINE_START_REGEX.test(arg)) {
                    patternsArray.push(arg);
                } else{
                    break;
                }
            }
            if(patternsArray.length==0){
                return error("At least one pattern to highlight is required for '"+arg1+"'.");
            }
            
            addHighlightPattern(colorText, colorInfo.modifiers, patternsArray);
            i=j;
            continue;
        }
        

        return error("Wrong option: " + arg1+"'");
    }
    return true;
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
function highlightLine (line) {
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

function buildLiner (writer, eventEmitter) {
    var liner = require('./liner')();

    liner.on('readable', function () {
        var line;
        while (line = liner.read()) {
            writer.write(highlightLine(line)+'\n');
        }
    });
    liner.on('end', function () {
        eventEmitter.emit('finished');
    });

    return liner;
}

function buildColorFromText(highlightColorArg){
    var colorsText = highlightColorArg.split('.');
    var colorStr = argDefaultStyle;
    for(var i=0; i<colorsText.length; i++){
        var colorText = colorsText[i];
        if(colorStr.length>0){
            colorStr += '.';
        }
        colorStr += colorText;
    }
    return buildAnsiColor(colorStr);
}

function execute (args, writer) {
    argFile = null; 
    argConfig = null;
    argCaseSensitive = false;
    argDefaultStyle = '';
    argHelp = false;
    highlightOptions = [null];
    
    
    var optionsResult = validateAndBuildOptions(args);
    if (optionsResult!==true) {
        console.log(optionsResult);
        printHelp();
        return;
    }

    if (argHelp) {
        printHelp();
        return;
    }
    if(highlightOptions.length===1 && highlightOptions[0]===null){
        console.log(error("No highlight pattern specified"));
        printHelp();
        return;
    }
    
    

    // Transform highlight pattern into valid regexp.
    for(var i=0; i<highlightOptions.length; i++){
        var highlightOption = highlightOptions[i];
        if(highlightOption){
            // Regex case option
            var caseOption = argCaseSensitive?'':'i'; // Case sensitive is default regex option
            if(highlightOption.modifiers['cs']){
                caseOption = '';
            }
            if(highlightOption.modifiers['ci']){
                caseOption = 'i';
            }
            
            // Cache pattern as regex.
            var patternListStr = '';
            for (var j = highlightOption.patternArray.length-1; j >= 0 ; j--) { // Iterate in reverse order because we want that last pattern to override the previous.
                if(patternListStr.length>0){
                    patternListStr+='|';
                }
                patternListStr+=highlightOption.patternArray[j];
            }
            highlightOption.patternRegex = new RegExp(patternListStr, 'g'+caseOption);

            // Cache color
            highlightOption.colorAnsi = buildColorFromText(highlightOption.colorText);
        }
        
    }

//    console.log(JSON.stringify(highlightOptions, null, 2));
        
    var eventEmitter = new events.EventEmitter();
    var liner = buildLiner(writer, eventEmitter);
    if (argFile) {
        var source = fs.createReadStream(argFile);
        source.on('error', function (event) {
            console.log(event);
            process.exit(1);
        });
        source.pipe(liner);
    } else {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.pipe(liner);
    }
    
    return eventEmitter;
}

module.exports = execute;


