/**
 * try to rearranged ncode to the correct format
 * @param {String} ncode 
 */
function wash(ncode) {
    var brackets = isIntactBrackets(ncode);
    if (brackets.isLost) {
        throw Error("'(' ')'  looks not exactly matched, left size is " + brackets.left + " but right size is " + brackets.right)
    }
    return moreBracket(
        basicWash(ncode)
    )
}
/**
 * test bracket is intact
 * @param {String} ncode 
 */
function isIntactBrackets(ncode) {
    var left = (ncode.match(/\(/g) || []).length;
    var right = (ncode.match(/\)/g) || []).length;
    return {
        left: left,
        right: right,
        isLost: left - right
    }
}
/**
 * replace bracket to simple
 * @param {String} ncode 
 */
function basicWash(ncode) {
    return ncode
        .replace(/\s{2,}/g, "") // replace blank character to ""
        .replace(/(.+)(\()/g,'$1>$2') // replace div() to  div>()
        .replace(/\((.+)\)>/g, "($1)+") //  replace ()> to ()+
        .replace(/\((.+)\)\((.+)\)/g, '($1)+($2)') // replace ()() to ()+()
        .replace(/\+\(([^\)]+)\)/g, "+$1") // replace  +(div) extra bracket  to  +div
}
/**
 * replace like ( ncode ) to 
 * but it is useless
 * @param {String} ncode 
 */
function startAtBracket(ncode) {
    if (ncode.startsWith('(')) {
        var end = findEndBracket(ncode);
        if (ncode[end + 1] == "+") {// if next of end bracket is + it could be likely ( )+
            return ncode;
        }
        var str = ncode.substring(1, end); // between ( and  )
        if (end != ncode.length - 1) { // not the end
            str += ncode.substr(end + 1);
            ncode = str;
            return startAtBracket(ncode);
        } else {
            ncode = str;
        }
    }
    return ncode;
}
function moreBracket(ncode) {
    var match = /\({2,}/.exec(ncode);
    if (match) {
        var len = match[0].length;
        var from = match.index;
        var end = findEndBracket(ncode, from);
        if (end) {
            var str = "(" + ncode.substring(from + len, end - len + 1) + ")" + ncode.substring(end + 1);
            if (from != 0) {
                str = ncode.substring(0, from) + str
            }
            ncode = str
            return moreBracket(ncode);
        }
    }
    return ncode;
}