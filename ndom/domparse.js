require('./style.js')
/**
 * parse vitrualnode
 * @param {VirtualNode} virtualNode 
 * @param {HTMLElement} parent
 */
function treeParse(virtualNode, parent) {
    var _this = this;
    var loopSize = virtualNode.size;
    var children = virtualNode.children;
    var tag = virtualNode.tag;

    virtualNode.parent = parent;
    if (!virtualNode.doms) {
        virtualNode.doms = [];
    }
    if (typeof loopSize == 'function') {
        loopSize = parseInt(loopSize.call(virtualNode.data || {}));
    }
    if (isNaN(loopSize)) {
        loopSize = 1;
    }
    for (var i = 0; i < loopSize; i++) {
        if (tag) {
            var result = createDOM(virtualNode, i,_this.styled);
            var dom = result.dom;
            virtualNode.doms.push(dom);
            if (result.noMore) {
                continue;
            }
            parent = dom
        }
        if (children) {
            children.forEach(function (node) {
                treeParse.call(_this,node, parent);
            })
        }
    }
}
function getset(ele) {
    ele.dataGet = function (name) {
        if (this.virtual.data) {
            return this.virtual.data[name];
        }
    }
    ele.dataSet = function (name, val) {
        if (this.virtual.data) {
            var caller = arguments.callee.caller;
            this.virtual.data[name] = val;
            if (caller == this.virtual._html || caller == this.virtual.text) {
            } else {
                var exec = this.virtual._html || this.virtual.text;
                if (this.virtual._html) {
                    this.innerHTML = exec.call(this)
                } else if (this.virtual.text) {
                    if(this.innerText){
                        this.childNodes[0].textContent  =exec.call(this)
                    }else{
                        this.innerText = exec.call(this)
                    }
                }
            }
            return val;
        }
    }
}
/**
 * Observer Data to update dom text or html
 * @param {Any} data 
 */
function createDOM(virtualNode, index,styled) {
    var ele = document.createElement(virtualNode.tag);
    var data = virtualNode.data;
    var parent = virtualNode.parent;
    var result = { dom: ele, noMore: false }
    ele.index = index;
    parent.appendChild(ele);
    ele.virtual = virtualNode;
    Object.defineProperty(ele,'parent',{
        get:function(){
            return this.virtual.parent;
        }
    });
    getset(ele);
    var text = virtualNode.text;
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
        var attrs = virtualNode.attributes;
        for (var key in attrs) {
            ele.setAttribute(key, attrs[key])
        }
    }
    if(virtualNode.style){
        var style = virtualNode.style;
        for(var key in style){
            var stylekey = key.replace(/\-([a-z])/g,function(e){ // some-define --> someDefine
               return e.substring(1).toUpperCase();
            });
            if(ele.style.hasOwnProperty(stylekey)){
                ele.style[stylekey] = styleValueParse(style[key], styled);
                if(ele.style[stylekey] === ""){
                    console.log('%c[STYLE-VALUE-WARN] : set style [ ' + stylekey + " : " + style[key] +" ] not success, because < " + style[key] + " > is  a invalid value" ,"color:orange")
                }
            }else{
                console.log('%c[STYLE-NAME-WARN]: set style [ ' + stylekey + " : " + style[key] +" ] not success, because < " + key  + " > is a invalid stylename" ,"color:orange")
            }
        }
    }
    var _html = virtualNode._html;
    if (_html) { // cut up
        if (typeof _html == "function") {
            ele.innerHTML  = _html.call(ele, data);
        }else if (_html instanceof Ndom) {
            _html._ndom.doms.forEach(function(dom){
                ele.appendChild(dom)
            })
        }else{
            ele.innerHTML  = _html;
        }
        result.noMore = true;
    }
    eventBind(virtualNode,ele);
    return result;
}
function eventBind(virtualNode,ele){
    var keys = Object.keys(virtualNode)||[];
    keys.forEach(function(eventName){
        if(eventName.startsWith("$")){
            ele.addEventListener(eventName.substring(1),virtualNode[eventName],{useCapture:false})
        }
    })
}
