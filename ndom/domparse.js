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
            if (arguments.callee.caller == this.virtual._html) {
            } else {
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
