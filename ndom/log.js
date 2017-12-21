window.onerror = function errors(message,atfile,linenumber,columnnumber,error){
    if(error){
        document.write(error.name+error.message+"@"+atfile +":"+ linenumber + ":"+columnnumber)
    }else{
        document.writeln([message,atfile,linenumber,columnnumber,error])
    }
}
console.log = (function(oriLogFunc){
    return function()
    {
    	var arr = [].slice.call(arguments);
    	var str = arr.map(function(el){
    		if(el+"" == '[object Object]'){
    			return JSON.stringify(el)
    		}
    		return el;
    	}).join(' ');
    	try { throw new Error(); } catch (e) {
        	var loc = e.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/, "");
            oriLogFunc.call(console,str+"\n"+loc);
            document.body.innerText = "INFO : " +str +'\r\n'+ loc;
        }
    }
})(console.log);
console.error = (function(oriLogFunc){
    return function()
    {
    	var arr = [].slice.call(arguments);
    	var str = arr.map(function(el){
    		if(el+"" == '[object Object]'){
    			return JSON.stringify(el)
    		}
    		return el;
    	}).join(' ');
    	oriLogFunc.apply(console,arr);
    	var strs = ""
    	try { throw new Error(); } catch (e) {
        	var stack = e.stack.split('\n').slice(2).join('\n');
        	var loc= e.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/, "");
        	strs+= stack ;
        }
        document.body.innerText = "ERROR : " +str +'\r\n'+ strs;
    }
})(console.error);