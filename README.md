# ndom
a dom generator zen coding style like
# use ndom
```
ndom('div').html() ==> <div></div>
ndom('div{ Hello Ndom ! }').html()  ==> <div> Hello Ndom ! </div>
ndom('div[name=myname]{ Hello Ndom ! }').html()  ==> <div name="myname"> Hello Ndom ! </div>
ndom('div[name=myname]{ Hello Ndom ! }*2').html()  ==> <div name="myname"> Hello Ndom ! </div><div name="myname"> Hello Ndom ! </div>
ndom('div[name=myname]{ Hello Ndom ! }+span{ new dom }').html()  ==> <div name="myname"> Hello Ndom ! </div><span> new dom </span>
```