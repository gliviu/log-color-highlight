var ansi = require('ansi-styles');

module.exports = {
    /**
     * Transform highlight pattern into valid regexp
     * and add the regexp to options.
     */
    addRegexpToOptions(options) {
        for (var i = 0; i < options.highlightOptions.length; i++) {
            var highlightOption = options.highlightOptions[i];
            if (highlightOption) {
                // Regex case option
                var caseOption = options.caseSensitive ? '' : 'i'; // Case sensitive is default regex option
                if (highlightOption.modifiers['cs']) {
                    caseOption = '';
                }
                if (highlightOption.modifiers['ci']) {
                    caseOption = 'i';
                }
                var shouldEscape = highlightOption.modifiers['esc'] === true;
                var wholeLine = highlightOption.modifiers['wl'] === true;
    
                // Cache pattern as regex.
                var patternListStr = '';
                for (var j = highlightOption.patternArray.length - 1; j >= 0; j--) { // Iterate in reverse order because we want that last pattern to override the previous.
                    if (patternListStr.length > 0) {
                        patternListStr += '|';
                    }
                    patternStr = highlightOption.patternArray[j];
                    if (shouldEscape) {
                        patternStr = escapeRegExp(patternStr);
                    }
                    if (wholeLine) {
                        patternStr = '.*?' + patternStr + '.*';
                    }
                    patternListStr += patternStr;
                }
                highlightOption.patternRegex = new RegExp(patternListStr, 'g' + caseOption);
    
                // Cache color
                highlightOption.colorAnsi = buildColorFromText(highlightOption.colorText, options.defaultStyle);
            }
        }
    }
}

function buildColorFromText(highlightColorArg, defaultStyle) {
    var colorsText = highlightColorArg.split('.');
    var colorStr = defaultStyle;
    for (var i = 0; i < colorsText.length; i++) {
        var colorText = colorsText[i];
        if (colorStr.length > 0) {
            colorStr += '.';
        }
        colorStr += colorText;
    }
    return buildAnsiColor(colorStr);
}

//Receives 'color1.color2...'.
//Returns {open:'ansi open codes', close:'ansi close codes'}
function buildAnsiColor(colorsStr) {
    var colorsArray = colorsStr.split('.');
    var ansiOpen = '';
    var ansiClose = '';
    for (var i = 0; i < colorsArray.length; i++) {
        var colorStr = colorsArray[i];
        ansiOpen += ansi[colorStr].open
        ansiClose = ansi[colorStr].close + ansiClose;
    }
    return { open: ansiOpen, close: ansiClose };
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
