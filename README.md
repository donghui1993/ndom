# ndom
a dom generator zen coding style like

## download 

```shell
git git@github.com:donghui1993/ndom.git
npm run build
```

## USE ndom basic
```javascript
ndom('div').html() 
//==> <div></div>

ndom('div{ Hello Ndom ! }').html() 
//==> <div> Hello Ndom ! </div>

ndom('div[name=myname]{ Hello Ndom ! }').html() 
//==> <div name="myname"> Hello Ndom ! </div>

ndom('div[name=myname]{ Hello Ndom ! }*2').html()
//==> <div name="myname"> Hello Ndom ! </div><div name="myname"> Hello Ndom ! </div>

ndom('div[name=myname]{ Hello Ndom ! }+span{ new dom }').html()
//==> <div name="myname"> Hello Ndom ! </div><span> new dom </span>
```

## USE ndom parse
```javascript
var div = {
	html:"<div>this is new div in parent</div>"
}
var myname = {
	html:"<div>this is new div in myname</div>"
}
ndom('div+.myname',{
	parse:{ // use incomplete css selector
		"div":div,
		".myname":myname
	}
}).html() 

```
## APPEND to page
```javascript
var div = {
	html:"<div>this is new div in parent</div>"
}
var myname = {
	html:"<div>this is new div in myname</div>"
}
ndom('div+.myname',{
	parse:{ // use incomplete css selector
		"div":div,
		".myname":myname
	}
},
document.body // HTMLElement alrady exists in page
) 
```
or
```javascript
var div = {
	html:"<div>this is new div in parent</div>"
}
var myname = {
	html:"<div>this is new div in myname</div>"
}
ndom('div+.myname',{
	parse:{ // use incomplete css selector
		"div":div,
		".myname":myname
	}
}).parent(document.body) // must be cover 
```

## APPEND to page with init 
```javascript
var div = {
	html:"<div>this is new div in parent</div>"
}
var myname = {
	html:"<div>this is new div in myname</div>"
}
ndom('div+.myname',{
	mode:"fnname"
	parse:{ // use incomplete css selector
		"div":div,
		".myname":myname
	}
})
.fnname(function(){
	// do some init
})
.parent(document.body) // must be cover 
```

# MORE To be continued