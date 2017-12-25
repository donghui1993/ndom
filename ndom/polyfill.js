/**
 * polyfill for unsupport browser
 */
function polyfill(polyfillMapping) {
    for (var target in polyfillMapping) {
        if (eval(target) === void 0) {
            eval(target+'='+polyfillMapping[target].toString())
        }
    }
}
var polly = {
    "Object.assign": function (a) {
        if (target === void 0 || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var output = Object(a);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== void 0 && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    },
    "String.prototype.startsWith":function(str){
        return this.indexOf(str) === 0;
    }
}
polyfill(polly)