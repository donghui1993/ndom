require('./browser')
/**
 * styled is function define use in style partment
 * styled use start at %
 */
function StyleContent() { }

StyleContent.prototype.getValue = function () {
    if (Object.keys(this).length > 0) {
        let arr = [];
        for (let key in this) {
            let val = this[key];
            if (typeof val !== 'function') {
                arr.push([key, val].join(":"))
            }
        }
        return "{" + arr.join(";") + "}";
    }
    return ""
}

function styleShow(ndom, options) {
    let styles = styleParse(options.style, options.styled);
    let arr = [];
    ndom.styled = options.styled;
    for (let key in styles) {
        let val = styles[key];
        if (val instanceof StyleContent) {
            let nval = styles[key].getValue()
            if (nval != "") {
                arr.push([key, nval].join(" "))
            }
        }
    }
    let styleElement = document.createElement('style');
    styleElement.setAttribute('id', ndom.id)
    document.querySelector("head").appendChild(styleElement);
    styleElement.innerHTML = arr.join("\n")
}

function styleParse(style, styled, parentname, styleElement) {
    let styleNames = ndom.styleNames; // all of style name
    let next = parentname ? parentname + ">" : "";
    let lastSelector;
    if (!styleElement) {
        styleElement = new StyleContent;
        lastSelector = styleElement;
    } else {
        lastSelector = styleElement[parentname];
    }
    if (style && Object.keys(style).length > 0) {
        for (var key in style) {
            let val = style[key];
            let _key = key.replace(/([A-Z]+)/g, "-$1").toLocaleLowerCase();
            if (key.startsWith('$')) {
                // compose style like  $font:{ size:"",color:""}
                Object.assign(lastSelector, composeStyle(key.substring(1), val, styled));
            }
            else if (key.startsWith("_")) {
                if (key == "_") {
                    // only self
                    console.error("illegal : not just use _ for self because it is useless at  [" + parentname + "]")
                }
                else {
                    let selector = parentname + key.substring(1);
                    styleElement[selector] = new StyleContent
                    styleParse(val, styled, selector, styleElement)
                }
            }
            else {
                let hasin = styleNames.indexOf(_key);
                let browserStyle = "";
                prefix.forEach(function (pre) {
                    let styleName = pre + _key;
                    if (hasin === -1) {
                        hasin = styleNames.indexOf(styleName);
                    }
                    if (browserStyle == "" && hasin > - 1) {
                        browserStyle = styleName
                    }
                })
                if (hasin === -1) {
                    // is a css selector
                    if (val + "" == "[object Object]") {
                        let selector = next + key;
                        styleElement[selector] = new StyleContent
                        styleParse(val, styled, selector, styleElement)
                    } else {
                        console.error("illegal : not such style [" + key + "]  ");
                    }
                }
                else { // is a style 
                    lastSelector[browserStyle] = styleValueParse(val, styled)
                }
            }
        }
    }
    return styleElement;
}

function styleValueParse(val, styled) {
    if (val.startsWith("%")) {
        let params = val.substring(1).match(/([a-zA-Z]\w*)\((.+)\)/);
        let fn = params[1];
        let args = ((params[2] || "").split(",") || []).map(function (el) {
            return el.replace(/^['"](.+)['"]$/, "$1")
        })
        return styled[fn].apply(null, args);
    }
    return val;
}
function composeStyle(start, styles, styled) {
    var cp = {};
    for (var part in styles) {
        cp[start + "-" + part] = styleValueParse(styles[part], styled);
    }
    return cp;
}
function styleMixin(pre, current) {
    if (!pre) {
        pre = {};
    }
    return Object.assign(pre, current);
}
