/**
 * split all attributes from simplecode to virtualnode
 * @param {String} simplecode 
 * @param {VirtualNode} virtualnode 
 */
function analyzer(simplecode, virtualnode) {
    [
        [/\[.+\]/, "attributes"],
        [/\{.+\}/, "text"],
        [/\.\w+[_-]?\w+$/, "classList"],
        [/#\w+/, "id"]
    ].forEach(function (piter) {
        if (piter[0].test(simplecode)) {
            var cp = analyzer[piter[1]](simplecode);
            simplecode = cp[1]; // replace new simplecode from function execute
            virtualnode[piter[1]] = cp[0];
        }
    })
    virtualnode.tag = analyzer.tag(simplecode)
    virtualnode.size *= analyzer.size(simplecode)
}
/**
 * find the attributes from code 
 * like  [key=value][key1=value1,key2=value2]
 * get the only last of attributes if key is repeated
 * @param {String} simplecode 
 */
analyzer.attributes = function splitAttr(simplecode) {
    var leftText = simplecode + "";
    var attr = findEachCharIndexOf(simplecode, /\[/)
        .map(function (from) {
            var end = findEndBracket(simplecode, from, '[', ']');
            var attrCoper = simplecode.substring(from + 1, end); // from next char of [ and get key=valyue strs
            leftText = leftText.replace("[" + attrCoper + "]", "")
            if (!attrCoper || attrCoper.trim() == "=") {// it is too like this '[] or [=]'
                return
            } else if (attrCoper.indexOf("=") != -1) { // it has equals signer
                return attrCoper.split(',')
                    .map(function (kvcoper) {
                        var kv = kvcoper.split("=");
                        return array2Map(kv);
                    })
                    .nreduce(function (pre, next) {
                        return Object.assign(pre, next);
                    })
            }
        })
        .nreduce(function (pre, next) {
            if (!pre) {
                return next;
            }
            return Object.assign(pre, next);
        })
    return [attr, leftText];
}

/**
 * get text from simplecode in {  }
 * will be concat all text value if more than one 
 * @param {String} simplecode 
 */
analyzer.text = function splitText(simplecode) {
    var leftText = simplecode + "";
    var closeto = 0;
    var attr = findEachCharIndexOf(simplecode, /\{/)
        .map(function (from) {
            var end = findEndBracket(simplecode, from, '{', '}');
            if (end > closeto) {
                closeto = end;
                var textCoper = simplecode.substring(from + 1, end);
                leftText = leftText.replace("{" + textCoper + "}", "");
                return textCoper;
            }
            return "";
        })
        .nreduce(function (pre, next) {
            return pre + (next || "");
        })
    return [attr, leftText]
}
/**
 * find the id from code,
 * get the first of all ids if defined more than one
 * @param {String} simplecode 
 */
analyzer.id = function splitId(simplecode) {
    var id = (simplecode.match(/#[a-zA-Z0-9_-]+/g) || []).map(function (id) {
        simplecode = simplecode.replace(id, "");
        return id.slice(1); // remove '#'
    })[0];
    return [id, simplecode]
}

/**
 * find the classList from code
 * get the only one class if it is repeated
 * @param {String} simplecode 
 */
analyzer.classList = function splitClass(simplecode) {
    var sameclass = "";
    var classList = (simplecode.match(/\.\w+[_-]?\w+$/g) || [])
        .map(function (clazz) {
            simplecode = simplecode.replace(clazz, "")
            return clazz.slice(1); // remove '.'
        })
        .filter(function (clazz) {
            return sameclass == clazz ?
                false :
                (sameclass = clazz, true);
        });
    return [classList, simplecode];
}

/**
 * get tag from simplecode
 * default is div
 * @param {String} simplecode 
 */
analyzer.tag = function splitTag(simplecode) {
    return (simplecode.match(/^[a-zA-Z]\w*/) || ['div'])[0];
}
/**
 * get loop size from simplecode
 * it smallest is 1
 * @param {String} simplecode 
 */
analyzer.size = function splitSize(simplecode) {
    var size = parseInt((simplecode.match(/\*\d+/) || ['*1'])[0].slice(1))
    return size < 1 ? 1 : size;
}