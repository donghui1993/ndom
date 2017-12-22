function notInText(code) {
    var sqb = findEachCharIndexOf(code, /\[/); // find index of [ ]
    var lb = findEachCharIndexOf(code, /\{/); // find  index of { }
    // replace all of between [] or {} text to ""
    sqb.forEach(function (from) {
        var to = findEndBracket(code, from, "[", "]")
        code = code.replace(code.substring(from, to + 1), "");
    })
    lb.forEach(function (from) {
        var to = findEndBracket(code, from, "{", "}")
        code = code.replace(code.substring(from, to + 1), "");
    })
    // find if it is not in new code
    return !(code.indexOf("(") !== -1 ||
        code.indexOf("+") !== -1 ||
        code.indexOf(">") !== -1);
}
/**
 * if char equals left,return 1 else if char equals right return -1 else return 0
 * @param {String} char 
 * @param {String} left 
 * @param {String} right 
 */
function getBracket(char, left, right) {
    return char == left ? 1 :
        char == right ? -1 :
            0;
}
/**
 * find bracket must from left bracket to the right
 * @param {String} ncode 
 * @param {Number} from start at
 * @param {String} left left char default '('
 * @param {String} right right char default ')'
 */
function findEndBracket(ncode, from, left, right) {
    if (!left) {
        left = "("
    }
    if (!right) {
        right = ")"
    }
    if (typeof from != 'number') {
        from = 0;
    }
    var len = ncode.length,
        counter = 0; // counter brackets
    for (; from < len; from++) {
        if ((counter += getBracket(ncode[from], left, right)) <= 0) {
            break;
        }
    }
    return from;
}
/**
 * find the index of each character
 * @param {String} str strings
 * @param {RegExp} reg char regexp
 * @param {Array<Number>} indexarr
 */
function findEachCharIndexOf(str, reg, indexarr) {
    var arr = str.match(reg); //match regexp of char
    if (arr) {
        if (!indexarr) {
            indexarr = []
        }
        var lastest = indexarr[indexarr.length - 1];
        lastest = lastest == void 0 ? 0 : lastest + 1;
        indexarr.push(arr.index + lastest);
        return findEachCharIndexOf(str.slice(arr.index + 1), reg, indexarr);
    } else {
        return indexarr || [];
    }
}