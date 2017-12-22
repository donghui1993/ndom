/**
 * create vitualnode tree from part of ncode
 * @param {String} ncode 
 * @param {VirtualNode} virtualnode 
 */
function loader(ncode, options, virtualnode) {
    if (!virtualnode) {
        virtualnode = new VirtualNode;
    }
    var siblings = sameLevelSeparator(ncode);
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

/**
 * simple code without same level symbol
 * @param {String} simplecode 
 * @param {VirtualNode} virtualnode
 */
function spareparts(simplecode, options, virtualnode) {
    if (simplecode.startsWith(COMBIN)) { // (somecode)
        var endBracketIndex = findEndBracket(simplecode, 0);
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
        var len = simplecode.length,
            index = 0,
            cursor = 0;
        for (; index < len; index++) {
            var char = simplecode[index];
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
                    var end = findEndBracket(simplecode, index);
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
 * seprate same level from ncode
 * @param {String} ncode 
 */
function sameLevelSeparator(ncode) {
    var siblings = [];
    if (!SAME_LEVEL.test(ncode)) {
        siblings.push(ncode)
    } else {
        var len = ncode.length,
            cursor = 0;
        for (var i = 0; i < len; i++) {
            var char = ncode[i];
            if (char == "{") {
                i = findEndBracket(ncode, i, "{", "}");
                continue;
            }
            if (char == SIBLING) {
                var _sibling = ncode.substring(cursor, i);
                cursor = i; // move cursor to i;
                cursor++; // and jump over a symbol of sibling 
                (_sibling != SIBLING) && siblings.push(_sibling); // if _sibling not '+' ,put it to siblings 
            } else if (char == CHILD) {
                var _sibling = ncode.substring(cursor, len); // substring to the end
                cursor = len; // cursor is ended
                siblings.push(_sibling);
                break; // end for
            } else if (char == COMBIN) {
                var endBracketIndex = findEndBracket(ncode, i);
                var from = cursor; // from (
                var to = endBracketIndex; // to )
                var cos = 0;
                if (ncode[endBracketIndex + 1] == '*') {
                    var preNumber = ncode.substring(endBracketIndex + 2).match(/^\d+/g)[0];
                    to += (preNumber.length + 2); // to *number 
                } else {
                    from = cursor + 1 // from ( of next
                    cos += 1;
                }
                var _sibling = ncode.substring(from, to); // take between '(' and ')' ;
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