const fs = require('fs');
var part =require('./part');
function writeFileSync(data){
    fs.writeFileSync(part.out,data,{encoding:"utf-8"});
}
function appendFileSync(data){
    fs.appendFileSync(part.out,data+"\r\n",{encoding:"utf-8"});
}
function watch(){
    part.path.forEach(filepath => {
        fs.watchFile(part.basepath+filepath,(currstate)=>{
            console.log('[file  changed] ' + filepath)
            build()
        })
    });
}
function build(){
    writeFileSync("!function(factory) {  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {   var target = module['exports'] || exports;  factory(target);  } else if (typeof define === 'function' && define['amd']) {   define(['exports'], factory);  } else { factory(window);  }  }(function(exp){  exp = typeof exp !== 'undefined' ? exp : {};\r\n")
    part.path.forEach(filepath => {
        let file = fs.readFileSync(part.basepath+filepath,{encoding:"utf-8"})
        appendFileSync(file)
    });
    appendFileSync("exp.ndom = ndom;});")
    var now = new Date;
    console.log("["+now.toLocaleDateString() +" "+ now.toLocaleTimeString() + '] build done')
}
watch();
build();