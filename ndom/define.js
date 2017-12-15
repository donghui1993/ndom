var SAME_LEVEL = /\+/;
// sibling
var SIBLING = '+';
// child
var CHILD = '>';
// left bracket of '( )'
var COMBIN = '(';
// without any combine or child relationship
var SIGN_CODE = /[\(>\+]/;
/**
 *  is Empty of Array
 */
Array.prototype.isEmpty = function () {
    return this.length === 0;
}

/**
 * if Array is empty not execute reduce
 * if array length = 1 ,execute fn
 * @param {Function} fn 
 */
Array.prototype.nreduce = function (fn) {
    if (!this.isEmpty()) {
        if (this.length == 1) {
            return fn(this[0]);
        }
        return this.reduce(fn);
    }
    return this;
}
/**
 * define virtual node
 */
function VirtualNode() {
    this.id;
    this.attributes;
    this.classList;
    this.tag;
    this.text;
    this.doms;
    this.size = 1;
    this.children;
    this.parent;
    Object.defineProperty(this, 'html', {
        get: function () {
            let html;
            if (this.parent && this.parent.isVirtual) {
                return this.parent.innerHTML;
            }
            if (this.doms) {
                html = this.doms.nreduce(function (dom, nextdom) {
                    if (nextdom) {
                        if (typeof dom == "string") {
                            return dom + nextdom.outerHTML;
                        }
                        return dom.outerHTML + nextdom.outerHTML;
                    }
                    return dom.outerHTML
                })
            } else if (this.children) {
                html = this.children.nreduce(function (dom, nextdom) {
                    if (nextdom) {
                        if (typeof dom == "string") {
                            return dom + nextdom.html;
                        }
                        return dom.html + nextdom.html;
                    }
                    if (dom instanceof Array) {
                        return dom[0].html;
                    } else {
                        return dom.html
                    }
                })
            }
            return html;
        }
    })
}