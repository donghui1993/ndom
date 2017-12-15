!function () {

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
    /**
     * try to rearranged ncode to the correct format
     * @param {String} ncode 
     */
    function wash(ncode) {
        let brackets = isIntactBrackets(ncode);
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
        let left = (ncode.match(/\(/g) || []).length;
        let right = (ncode.match(/\)/g) || []).length;
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
            let end = findEndBracket(ncode);
            if (ncode[end + 1] == "+") {// if next of end bracket is + it could be likely ( )+
                return ncode;
            }
            let str = ncode.substring(1, end); // between ( and  )
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
        let match = /\({2,}/.exec(ncode);
        if (match) {
            let len = match[0].length;
            let from = match.index;
            let end = findEndBracket(ncode, from);
            if (end) {
                let str = "(" + ncode.substring(from + len, end - len + 1) + ")" + ncode.substring(end + 1);
                if (from != 0) {
                    str = ncode.substring(0, from) + str
                }
                ncode = str
                return moreBracket(ncode);
            }
        }
        return ncode;
    }
    /**
     * create vitualnode tree from part of ncode
     * @param {String} ncode 
     * @param {VirtualNode} virtualnode 
     */
    function loader(ncode, options, virtualnode) {
        if (!virtualnode) {
            virtualnode = new VirtualNode;
        }
        let siblings = sameLevelSeparator(ncode);
        if (siblings.length == 1) {
            return spareparts(siblings[0], options, virtualnode);
        } else {
            if (!virtualnode.children) {
                virtualnode.children = [];
            }
            siblings.forEach(function (_sibling) {
                virtualnode.children.push(loader(_sibling, options));
            })
        }
        return virtualnode;
    }
    function notInText(code) {

        let sqb = findEachCharIndexOf(code, /\[/); // find index of [ ]
        let lb = findEachCharIndexOf(code, /\{/); // find  index of { }
        // replace all of between [] or {} text to ""
        sqb.forEach(function (from) {
            let to = findEndBracket(code, from, "[", "]")
            code = code.replace(code.substring(from, to + 1), "");
        })
        lb.forEach(function (from) {
            let to = findEndBracket(code, from, "{", "}")
            code = code.replace(code.substring(from, to + 1), "");
        })
        // find if it is not in new code
        return !(code.indexOf("(") !== -1 ||
            code.indexOf("+") !== -1 ||
            code.indexOf(">") !== -1);
    }
    /**
     * simple code without same level symbol
     * @param {String} simplecode 
     * @param {VirtualNode} virtualnode
     */
    function spareparts(simplecode, options, virtualnode) {
        if (simplecode.startsWith(COMBIN)) { // (somecode)
            let endBracketIndex = findEndBracket(simplecode, 0);
            if (simplecode[endBracketIndex + 1] == '*') { // is size symbol
                virtualnode.size = parseInt(simplecode.substring(endBracketIndex + 2)) || 1; // skip of '*' 
                simplecode = simplecode.substring(0, endBracketIndex + 1);
            }
            if (endBracketIndex == simplecode.length - 1) { // if ) is end of simplecode
                // why not use simplecode[simplecode.length-1] compare with ')'
                // because in this (some code )>( somecode ) ,but not so correct
                simplecode = simplecode.substring(1, simplecode.length - 1);
            }
        }
        virtualnode.ncode = simplecode;
        if (!SIGN_CODE.test(simplecode) || notInText(simplecode)) {
            if (simplecode.trim() == "") {
                return virtualnode;
            }
            analyzer(simplecode, virtualnode);
            optionFiller(virtualnode, options.parse);
        } else {
            // main code split from here
            let len = simplecode.length,
                index = 0,
                cursor = 0;
            for (; index < len; index++) {
                let char = simplecode[index];
                switch (char) {
                    case CHILD:
                        // left part  is parent and analize it 
                        analyzer(simplecode.substring(cursor, index), virtualnode)
                        optionFiller(virtualnode, options.parse)
                        if (!virtualnode.children) {
                            virtualnode.children = [];
                        }
                        // right part is child deep in loader
                        virtualnode.children.push(loader(simplecode.substring(index + 1, len), options));
                        return virtualnode;
                    case COMBIN:
                        // find end bracket of COMBIN
                        let end = findEndBracket(simplecode, index);
                        virtualnode.children.push(loader(simplecode.substring(cursor, end), options));
                        cursor = end + 1; // skip end bracket
                        index = end; // 
                    case SIBLING:
                        return Object.assign(loader(simplecode.substring(cursor, len), options), virtualnode);
                }
            }
        }

        return virtualnode;
    }
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
                let cp = analyzer[piter[1]](simplecode);
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
        let leftText = simplecode + "";
        let attr = findEachCharIndexOf(simplecode, /\[/)
            .map(function (from) {
                let end = findEndBracket(simplecode, from, '[', ']');
                let attrCoper = simplecode.substring(from + 1, end); // from next char of [ and get key=valyue strs
                leftText = leftText.replace("[" + attrCoper + "]", "")
                if (!attrCoper || attrCoper.trim() == "=") {// it is too like this '[] or [=]'
                    return
                } else if (attrCoper.indexOf("=") != -1) { // it has equals signer
                    return attrCoper.split(',')
                        .map(function (kvcoper) {
                            let kv = kvcoper.split("=");
                            return { [kv[0]]: kv[1] }
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
        let leftText = simplecode + "";
        let closeto = 0;
        let attr = findEachCharIndexOf(simplecode, /\{/)
            .map(function (from) {
                let end = findEndBracket(simplecode, from, '{', '}');
                if (end > closeto) {
                    closeto = end;
                    let textCoper = simplecode.substring(from + 1, end);
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
        let id = (simplecode.match(/#[a-zA-Z0-9_-]+/g) || []).map(function (id) {
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
        let sameclass = "";
        let classList = (simplecode.match(/\.\w+[_-]?\w+$/g) || [])
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
        let size = parseInt((simplecode.match(/\*\d+/) || ['*1'])[0].slice(1))
        return size < 1 ? 1 : size;
    }
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
            } else if (value instanceof Array) {
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
    /**
     * seprate same level from ncode
     * @param {String} ncode 
     */
    function sameLevelSeparator(ncode) {
        var siblings = [];
        if (!SAME_LEVEL.test(ncode)) {
            siblings.push(ncode)
        } else {
            let len = ncode.length,
                cursor = 0;
            for (let i = 0; i < len; i++) {
                let char = ncode[i];
                if (char == "{") {
                    i = findEndBracket(ncode, i, "{", "}");
                    continue;
                }
                if (char == SIBLING) {
                    let _sibling = ncode.substring(cursor, i);
                    cursor = i; // move cursor to i;
                    cursor++; // and jump over a symbol of sibling 
                    (_sibling != SIBLING) && siblings.push(_sibling); // if _sibling not '+' ,put it to siblings 
                } else if (char == CHILD) {
                    let _sibling = ncode.substring(cursor, len); // substring to the end
                    cursor = len; // cursor is ended
                    siblings.push(_sibling);
                    break; // end for
                } else if (char == COMBIN) {
                    let endBracketIndex = findEndBracket(ncode, i);
                    let from = cursor; // from (
                    let to = endBracketIndex; // to )
                    let cos = 0;
                    if (ncode[endBracketIndex + 1] == '*') {
                        let preNumber = ncode.substring(endBracketIndex + 2).match(/^\d+/g)[0];
                        to += (preNumber.length + 2); // to *number 
                    } else {
                        from = cursor + 1 // from ( of next
                        cos += 1;
                    }
                    let _sibling = ncode.substring(from, to); // take between '(' and ')' ;
                    siblings.push(_sibling);
                    i = to + cos; // over a ')'
                    cursor = i + 1;// over ')'
                }
            }
            if (cursor < len - 1) {// cursor is not to end
                siblings.push(ncode.substring(cursor, len)); // take from cursor to ncode end
            }

        }
        return siblings;
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
        let len = ncode.length,
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
        let arr = str.match(reg); //match regexp of char
        if (arr) {
            if (!indexarr) {
                indexarr = []
            }
            let lastest = indexarr[indexarr.length - 1];
            lastest = lastest == void 0 ? 0 : lastest + 1;
            indexarr.push(arr.index + lastest);
            return findEachCharIndexOf(str.slice(arr.index + 1), reg, indexarr);
        } else {
            return indexarr || [];
        }
    }
    /**
     * parse vitrualnode
     * @param {VirtualNode} virtualNode 
     * @param {HTMLElement} parent
     */
    function treeParse(virtualNode, parent) {
        let loopSize = virtualNode.size;
        let children = virtualNode.children;
        let tag = virtualNode.tag;
        virtualNode.parent = parent;
        if (!virtualNode.doms) {
            virtualNode.doms = [];
        }
        for (let i = 0; i < loopSize; i++) {
            if (tag) {
                let result = createDOM(virtualNode, i);
                let dom = result.dom;
                virtualNode.doms.push(dom);
                if (result.noMore) {
                    continue;
                }
                parent = dom
            }
            if (children) {
                children.forEach(function (node) {
                    treeParse(node, parent);
                })
            }
        }
    }
    function dataObser(data) {
        for (var k in data) {
            let val = data[k];
            let key = k;
            Object.defineProperty(data, k, {
                set(val) {
                    key = val;
                },
                get() {
                    return key;
                }
            })
            data[k] = val;
        }
    }
    function createDOM(virtualNode, index) {
        let ele = document.createElement(virtualNode.tag);
        let data = virtualNode.data;
        let parent = virtualNode.parent;
        let result = { dom: ele, noMore: false }
        ele.index = index;
        parent.appendChild(ele);
        ele.virtual = virtualNode;
        dataObser(data)
        ele.dataGet = function (name) {
            if (this.virtual.data) {
                return this.virtual.data[name];
            }
        }
        ele.dataSet = function (name, val) {
            if (this.virtual.data) {
                this.virtual.data[name] = val;
                if(arguments.callee.caller == this.virtual._html){
                }else{
                    this.innerHTML = this.virtual._html.call(ele);
                }
                return val;
            }
        }
        let text = virtualNode.text;
        if (text) { // cut up
            if (typeof text == "function") {
                text = text.call(ele, data);
            }
            if (text instanceof Ndom) {
                text = text.html();
            }
            ele.innerText = text;
        }

        if (virtualNode.id) {
            ele.setAttribute('id', virtualNode.id)
        }
        if (virtualNode.classList) {
            ele.classList = virtualNode.classList.join(" ");
        }
        if (virtualNode.attributes) {
            let attrs = virtualNode.attributes;
            for (let key in attrs) {
                ele.setAttribute(key, attrs[key])
            }
        }
        let _html = virtualNode._html;
        if (_html) { // cut up
            if (typeof _html == "function") {
                _html = _html.call(ele, data);
            }
            if (_html instanceof Ndom) {
                _html = _html.html();
            }
            ele.innerHTML = _html;
            result.noMore = true;
        }
        return result;
    }
    function Ndom(ncode, options, parent) {
        nocde = wash(ncode);
        let vitualNode = loader(nocde, options);
        if (!parent) {
            parent = document.createElement('div');
            parent.isVirtual = true;
        }
        treeParse(vitualNode, parent);
        let mode = options.mode;
        if (mode) {
            this[mode] = function (fn) {
                // it could be run until dom appened in a parent dom
                //TODO: some error code of mode 
                if (this._parent && !this._parent.isVirtual) {
                    if (this["mode_" + this.mode]) {
                        let result = this["mode_" + this.mode](this.data);
                        delete this["mode_" + this.mode];
                        return result;
                    } else {
                        this[this.mode] = fn(this.data);
                    }
                }
                else {
                    this["mode_" + this.mode] = fn;
                }
                return this;
            }
        }
        this._ndom = vitualNode;
        this.data = options.data;
        this._parent = parent;
        this.mode = mode;
        return this;
    }
    Ndom.prototype.parent = function (dom) {
        if (!dom) {
            return this._parent;
        }
        if (!this._parent || this._parent.isVirtual) {
            dom.innerHTML = this._ndom.html;
            this._parent = dom;
            if (this["mode_" + this.mode]) { // if mode is prepare
                this[this.mode] = this[this.mode](this.data);
            }
        }

        return this;
    }
    Ndom.prototype.html = function () {
        return this._ndom.html;
    }

    /**
     * @param {String} ncode  relationship of ncode for create domcument
     * @param {Object} options options of dom
     * @param {HTMLElement}  parent ndom dom position
     */
    function ndom(ncode, options, parent) {
        if (typeof ncode != 'string') {
            return "";
        }
        if (!options) {
            options = {};
        }
        return new Ndom(ncode, options, parent);
    }
    window.ndom = ndom;
}()