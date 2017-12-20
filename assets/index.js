!function () {
    var struct = {
        container: ".container>.header+.content+.footer",
        header: "ul.menu>li.item",
        content: "",
        footer: ""
    }

    ndom(struct.container, {
        styled:{
            height:function(pre){
                return  window.innerHeight  * parseInt(pre) /100 + "px";
            }
        },
        style: {
            'html,body':{
                margin:0,
                padding:0
            },
            body:{
                minHeight:'100%'
            },
            li: {
                $list: {
                    style: "none"
                }
            },
            '.item': {
                float: "left",
                $padding:{
                    top:0,
                    right:'10px',
                    bottom:0,
                    left:'10px'
                }
            }
        },
        parse: {
            '.header': {
                style:{
                    height: '%height(15)'
                },
                html: ndom(struct.header, {
                    parse: {
                        '.item': {
                            style:{

                            },
                            data: {
                                item: ["专注", "专心", "专业", "专情"]
                            },
                            size: function () {
                                return this.item.length;
                            },
                            text: function () {
                                return  this.dataGet('item')[this.index]
                            }
                        }
                    }
                })
            },
            '.content': {
                style:{
                    height: '%height(50)',
                    display: "flex",
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                text: "Hello N-Dom"
            },
            '.footer': {
                style:{
                    height: '%height(35)',
                    position:'absolute',
                    width:'100%',
                    bottom:0,
                    display: "flex",
                    alignItems: 'center',
                    backgroundColor:'green',
                    color:'white',
                    justifyContent: 'center'
                },
                text: "急于求成 -- N-DOM"
            }
        }
    }, document.body);


}()