require('./browser')
/**
 * styled is function define use in style partment
 * styled use start at %
 */
function StyleContent() { }

StyleContent.prototype.toString = function () {
    if (Object.keys(this).length > 0) {
        var arr = [];
        for (var key in this) {
            var val = this[key];
            if (typeof val !== 'function') {
                arr.push([key, val].join(":"))
            }
        }
        return "{\r\n" + arr.join(";\r\n") + "\r\n}";
    }
    return ""
}

function FrameConent() {

}

FrameConent.prototype = new StyleContent;

FrameConent.prototype.toString = function () {
    if (Object.keys(this).length > 0) {
        var arr = [];
        for (var key in this) {
            var val = this[key];
            if (typeof val !== 'function') {
                arr.push([key, val].join(" "))
            }
        }
        return "{\r\n" + arr.join("\r\n") + "\r\n}";
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
            var nval = styles[key].toString()
            if (nval != "") {
                arr.push([key, nval].join(" "))
            }
        }
    }
    if (arr.length > 0) {
        var styleElement = document.createElement('style');
        styleElement.setAttribute('id', ndom.id)
        document.querySelector("head").appendChild(styleElement);
        styleElement.innerHTML = arr.join("\n")
    }
}
function hasIn(stylename, prop) {
    if (stylename.hasOwnProperty(prop)) {
        return true;
    }
    if (stylename[prop] != void 0) {
        return true;
    }
    return false;
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
            switch (key[0]) {
                case '$':
                    Object.assign(lastSelector, composeStyle(key.substring(1), val, styled));
                    break;
                case '_':
                    if (key == "_") {
                        if (isCommonObject(val)) {
                            styleParse(val, styled, parentname, styleElement)
                        } else {
                            // only self
                            console.error("illegal : not just use _ for self because it is useless at  [" + parentname + "]")
                        }
                    }
                    else {
                        var selector = parentname + key.substring(1);
                        styleElement[selector] = new StyleContent
                        styleParse(val, styled, selector, styleElement)
                    }
                    break;
                case "@":
                    if (key === '@keyframes') {// key frames 
                        keyframesParse(val, styleElement, styleNames, styled)
                    }
                    break;
                default:
                    var result = correctName(styleNames, key);
                    if (!result.has) {
                        // is a css selector
                        if (isCommonObject(val)) {
                            var selector = next + key;
                            styleElement[selector] = new StyleContent
                            styleParse(val, styled, selector, styleElement)
                        } else {
                            console.error("illegal : not such style [" + key + "] ");
                        }
                    }
                    else { // is a style 
                        lastSelector[result.name] = styleValueParse(val, styled)
                    }
            }
        }
    }
    return styleElement;
}
var sprefix;
function keyframesParse(keyframes, styleElement, styleNames, styled) {
    if (sprefix === undefined) {
        var testName = correctName(styleNames, 'animation').name.split('-');
        if (testName.length !== 1) {
            sprefix = "-" + testName[1] + "-";
        } else {
            sprefix = "";
        }
    }

    var kframesname = '@' + sprefix + 'keyframes';
    for (var frameName in keyframes) {
        styleElement[kframesname + " " + frameName] = kframeName(keyframes[frameName]);
    }

    function kframeName(precences) {
        var conent = new FrameConent;
        for (var precence in precences) {
            conent[precence] = kframePrecent(precences[precence]);
        }
        return conent
    }
    function kframePrecent(style) {
        var conent = new StyleContent;
        for (var styleName in style) {
            var result = correctName(styleNames, styleName);
            if (result.has) {
                conent[result.name] = styleValueParse(style[styleName], styled);
            }
        }
        return conent;
    }
}

function correctName(styleNames, styleName, prefixename) {
    var result = { has: false, name: "" }
    if (!isString(prefixename)) {
        prefixename = "";
    }
    styleName = browserName(styleName)

    for (var i = 0; i < prefix.length; i++) {
        var name = prefixename + prefix[i] + styleName;
        if (hasIn(styleNames, name)) {
            result.has = true;
            result.name = name;
            return result;
        }
    }
    return result;
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
function browserName(style){
    return style.replace(/([A-Z])/g, function (el) {
        return "-" + el.toLowerCase()
    });
}
function composeStyle(start, styles, styled) {
    var cp = {};
    for (var part in styles) {
        cp[browserName(start + "-" + part)] = styleValueParse(styles[part], styled);
    }
    return cp;
}
function styleMixin(pre, current) {
    if (!pre) {
        pre = {};
    }
    return Object.assign(pre, current);
}
