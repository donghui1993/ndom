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
            virtualnode.classList.forEach(function (clazz) {
                if ("." + clazz == key) {
                    optionFiller.copy(virtualnode, parse[key])
                }
            });
        } else if (key == "#" + virtualnode.id) {
            optionFiller.copy(virtualnode, parse[key])
        } else if (key == virtualnode.tag) {
            optionFiller.copy(virtualnode, parse[key])
        } else {
            if (virtualnode.attributes) {
                Object.keys(virtualnode.attributes).forEach(function (attrkey) {
                    let kv = "[" + attrkey + "=" + virtualnode.attributes[attrkey] + "]"
                    if (key == kv) {
                        optionFiller.copy(virtualnode, parse[key])
                    }
                });

            }
        }
    })
}
optionFiller.copy = function (virtualnode, val) {
    let valkeys = Object.keys(val);
    if (!val || !Object.keys(val).length) {
        return
    }
    valkeys.forEach(function (key) {
        let value = val[key];
        if (key == "html") {
            virtualnode._html = value;
        }else if (value instanceof Array) {
            if (virtualnode[key]) {
                virtualnode[key].concat(value)
            } else {
                virtualnode[key] = value;
            }
        } else if (value + "" == "[object Object]") {
            if (virtualnode[key]) {
                Object.assign(virtualnode[key], value)
            } else {
                virtualnode[key] = value;
            }
        } else {
            virtualnode[key] = value;
        }
    })
}