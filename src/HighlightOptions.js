const ansi = require('ansi-styles')

module.exports = {
    /**
     * Transform highlight pattern into valid regexp
     * and add the regexp to options.
     */
    addRegexpToOptions(options) {
        for (let i = 0; i < options.highlightOptions.length; i++) {
            const highlightOption = options.highlightOptions[i]
            if (highlightOption) {
                // Regex case option
                let caseOption = options.caseSensitive ? '' : 'i' // Case sensitive is default regex option
                if (highlightOption.modifiers['cs']) {
                    caseOption = ''
                }
                if (highlightOption.modifiers['ci']) {
                    caseOption = 'i'
                }
                const shouldEscape = highlightOption.modifiers['esc'] === true
                const wholeLine = highlightOption.modifiers['wl'] === true
    
                // Cache pattern as regex.
                let patternListStr = ''
                for (let j = highlightOption.patternArray.length - 1; j >= 0; j--) { // Iterate in reverse order because we want that last pattern to override the previous.
                    if (patternListStr.length > 0) {
                        patternListStr += '|'
                    }
                    patternStr = highlightOption.patternArray[j]
                    if (shouldEscape) {
                        patternStr = escapeRegExp(patternStr)
                    }
                    if (wholeLine) {
                        patternStr = '.*?' + patternStr + '.*'
                    }
                    patternListStr += patternStr
                }
                highlightOption.patternRegex = new RegExp(patternListStr, 'g' + caseOption)
    
                // Cache color
                highlightOption.colorAnsi = buildColorFromText(highlightOption.colorText, options.defaultStyle)
            }
        }
    }
}

function buildColorFromText(highlightColorArg, defaultStyle) {
    const colorsText = highlightColorArg.split('.')
    let colorStr = defaultStyle
    for (let i = 0; i < colorsText.length; i++) {
        const colorText = colorsText[i]
        if (colorStr.length > 0) {
            colorStr += '.'
        }
        colorStr += colorText
    }
    return buildAnsiColor(colorStr)
}

//Receives 'color1.color2...'.
//Returns {open:'ansi open codes', close:'ansi close codes'}
function buildAnsiColor(colorsStr) {
    const colorsArray = colorsStr.split('.')
    let ansiOpen = ''
    let ansiClose = ''
    for (let i = 0; i < colorsArray.length; i++) {
        const colorStr = colorsArray[i]
        ansiOpen += ansi[colorStr].open
        ansiClose = ansi[colorStr].close + ansiClose
    }
    return { open: ansiOpen, close: ansiClose }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
