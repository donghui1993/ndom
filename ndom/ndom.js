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