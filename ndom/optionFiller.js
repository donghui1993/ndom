/**
 * 
 * @param {VirtualNode} virtualnode 
 * @param {Any} parse 
 */
function optionFiller(virtualnode, parse) {
    if (!parse || !Object.keys(parse).length) {
        return
    }
    var keys = Object.keys(parse);
    keys.forEach(function (key) {
        // find from classList,id,tag,attributes
        if (virtualnode.classList) {
            var isParse = false;
            virtualnode.classList.forEach(function (clazz) {
                if ("." + clazz == key) {
                    optionFiller.copy(virtualnode, parse[key])
                }
            });
            if (isParse) {
                return;
            }
        }
        if (key == "#" + virtualnode.id) {
            optionFiller.copy(virtualnode, parse[key])
            return;
        }
        if (key == virtualnode.tag) {
            optionFiller.copy(virtualnode, parse[key])
            return;
        }

        if (virtualnode.attributes) {
            Object.keys(virtualnode.attributes).forEach(function (attrkey) {
                var kv = "[" + attrkey + "=" + virtualnode.attributes[attrkey] + "]"
                if (key == kv) {
                    optionFiller.copy(virtualnode, parse[key])
                }
            });

        }

    })
}
optionFiller.copy = function (virtualnode, val) {
    var valkeys = Object.keys(val);
    if (!val || !Object.keys(val).length) {
        return
    }
    valkeys.forEach(function (key) {
        var value = val[key];
        var preValue = virtualnode[key];
        if (key == "html") {
            virtualnode._html = value;
        }
        else if (key == "style") {
            virtualnode.style = styleMixin(preValue, value);
        }
        else if (value instanceof Array) {
            if (preValue) {
                virtualnode[key] = preValue.concat(value)
            } else {
                virtualnode[key] = value;
            }
        }
        else if (value + "" == "[object Object]") {
            if (preValue) {
                Object.assign(virtualnode[key], value)
            } else {
                virtualnode[key] = value;
            }
        }
        else {
            virtualnode[key] = value;
        }
    })
}