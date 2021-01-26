module.exports = {
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
    highlight(line, highlightOptions) {
        const sections = []
        for (let i = 0; i < highlightOptions.length; i++) {
            const highlightOption = highlightOptions[i]
            if (highlightOption) {
                let match
                while (match = highlightOption.patternRegex.exec(line)) {
                    const b2 = highlightOption.patternRegex.lastIndex - 1
                    const b1 = b2 - match[0].length + 1
                    for (let j = 0; j < sections.length; j++) {
                        const section = sections[j]
                        if (section != null) {
                            const a1 = section.start
                            const a2 = section.end
                            if (b1 <= a1 && b2 >= a2) { // Case 2
                                // Remove section.
                                sections[j] = null
                            } else if (b1 <= a1 && b2 >= a1 && b2 < a2) { // Case 3
                                section.start = b2 + 1
                            } else if (b1 > a1 && b1 <= a2 && b2 >= a2) { // Case 4
                                section.end = b1 - 1
                            } else if (b1 > a1 && b2 < a2) { // 5
                                sections.push({ start: a1, end: b1 - 1, colorAnsi: sections[j].colorAnsi })
                                sections.push({ start: b2 + 1, end: a2, colorAnsi: sections[j].colorAnsi })
                                sections[j] = null
                            }
                        }
                    }
                    sections.push({ start: b1, end: b2, colorAnsi: highlightOption.colorAnsi })
                }
            }
        }
        const result = []
        let current = 0

        sections.sort((a, b) => {
                if (a === null && b === null) {
                    return 0
                }
                if (a === null && b !== null) {
                    return 1
                }
                if (a !== null && b === null) {
                    return -1
                }

                return a.start - b.start
            })

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i]
            if (section) {
                result.push(line.substr(current, section.start - current))
                result.push(section.colorAnsi.open)
                result.push(line.substr(section.start, section.end - section.start + 1))
                result.push(section.colorAnsi.close)
                current = section.end + 1
            } else {
                break
            }
        }
        result.push(line.substr(current, line.length - current))

        return result.join('')
    }
}


