require('./browser')
/**
 * styled is function define use in style partment
 * styled use start at %
 */
function StyleContent() { }

StyleContent.prototype.getValue = function () {
    if (Object.keys(this).length > 0) {
        var arr = [];
        for (var key in this) {
            var val = this[key];
            if (typeof val !== 'function') {
                arr.push([key, val].join(":"))
            }
        }
        return "{" + arr.join(";") + "}";
    }
    return ""
}

function styleShow(ndom, options) {
    var styles = styleParse(options.style, options.styled);
    var arr = [];
    ndom.styled = options.styled;
    for (var key in styles) {
        var val = styles[key];
        if (val instanceof StyleContent) {
            var nval = styles[key].getValue()
            if (nval != "") {
                arr.push([key, nval].join(" "))
            }
        }
    }
    if(arr.length>0){
        var styleElement = document.createElement('style');
        styleElement.setAttribute('id', ndom.id)
        document.querySelector("head").appendChild(styleElement);
        styleElement.innerHTML = arr.join("\n")
    }
}

function styleParse(style, styled, parentname, styleElement) {
    var styleNames = ndom.styleNames; // all of style name
    var next = parentname ? parentname + ">" : "";
    var lastSelector;
    if (!styleElement) {
        styleElement = new StyleContent;
        lastSelector = styleElement;
    } else {
        lastSelector = styleElement[parentname];
    }
    if (style && Object.keys(style).length > 0) {
        for (var key in style) {
            var val = style[key];
            
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
                    var selector = parentname + key.substring(1);
                    styleElement[selector] = new StyleContent
                    styleParse(val, styled, selector, styleElement)
                }
            }
            else {
                var _key = key.replace(/([A-Z]+)/g, "-$1").toLocaleLowerCase();
                var hasin = styleNames.hasOwnProperty(_key);
               
                var browserStyle = "";
                prefix.forEach(function (pre) {
                    var styleName = pre + _key;
                    if (!hasin) {
                        hasin = styleNames.hasOwnProperty(styleName);
                    }
                    if (browserStyle == "" && hasin > - 1) {
                        browserStyle = styleName
                    }
                })
                if (!hasin) {
                    // is a css selector
                    if (val + "" == "[object Object]") {
                        var selector = next + key;
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
    
    if (isString(val) && val.startsWith("%")) {
        var params = val.substring(1).match(/([a-zA-Z]\w*)\((.+)\)/);
        var fn = params[1];
        var args = ((params[2] || "").split(",") || []).map(function (el) {
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
