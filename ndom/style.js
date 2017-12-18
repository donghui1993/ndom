function StyleContent (){ }

StyleContent.prototype.getValue = function(){
    if(Object.keys(this).length>0){
        let arr = [];
        for(let key in this){
            let val = this[key];
            if(typeof val !== 'function'){
                arr.push( [key, val].join(":"))
            }
        }
        return "{"+arr.join(";")+"}";
    }
    return  ""
}
function styleShow(style){
    let styles = styleParse(style);
    let arr = [];
    for(let key in styles){
        let val =  styles[key];
        if(val instanceof StyleContent){
            let nval = styles[key].getValue()
            if(nval != ""){
                arr.push(  [ key,  nval].join(" ")  )
            }
        }
    }
    let styleElement = document.createElement('style');
    document.querySelector("head").appendChild(styleElement);
    styleElement.innerHTML = arr.join("\n")
}
function styleParse(style,parentname,styleElement){
    let styleNames = ndom.styleNames; // all of style name
    let next = parentname?parentname+">":"";
    let lastSelector ;
    if(!styleElement){
        styleElement = new StyleContent;
        lastSelector = styleElement;
    }else{
        lastSelector = styleElement[parentname];
    }
    if(style && Object.keys(style).length >0){
        for(var key in style){
            let val = style[key];
            let _key = key.replace(/([A-Z]+)/g,"-$1").toLocaleLowerCase();
            
            if(key.startsWith('$')){ // compose style like  $font:{ size:"",color:""}
                Object.assign(lastSelector,composeStyle(key.substring(1),val));
            }
            else if(styleNames.indexOf(_key) === -1){ // is a css selector
                if(val+"" == "[object Object]"){
                    let selector = next+key;
                    styleElement[selector] = new StyleContent
                    styleParse(val,selector, styleElement )
                }else{
                    console.error("illegal : not such style ["+key+"]  ");
                }
            }else{ // is a style 
                lastSelector[_key] = val
            }
        }
    }
    return styleElement;
}
function composeStyle(start,styles){
    var cp ={};
    for(var part in styles){
        cp[start+"-"+part] = styles[part];
    }
    return cp;
}
function styleMixin(pre,current){
    if(!pre){
        pre = {};
    }
    return Object.assign(pre,current);
}
