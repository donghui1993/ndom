const fs = require('fs');
var part =require('./part');
fs.writeFileSync(part.out,"",{encoding:"utf-8"})
part.path.forEach(filepath => {
    let file = fs.readFileSync(part.basepath+filepath,{encoding:"utf-8"})
    fs.appendFileSync(part.out,file+"\r\n")
});
