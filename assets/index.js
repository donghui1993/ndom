! function() {
    var struct = {
        container: ".container>.header+.content+.footer",
        header: "ul.menu>li.item",
        content: "div",
        footer: ""
    }
    var globalStyle = {
        'html,body': { margin: 0, padding: 0 },
        body: { minHeight: '100%' },
        li: {
            '_.item': {
                float: "left",
                margin: "0 10px"
            },
            $list: {
                style: "none"
            }
        },
        a: {
            'text-decoration': "none",
            '_:link': {
                color: "blue"
            },
            '_:visited': {
                color: "blue"
            }
        },
        '.header': {
            height: '%height(15)'
        },
        '.content': {
            height: '%height(50)',
            display: "flex",
            alignItems: 'center',
            justifyContent: 'center',
            '.text': {
                "_:hover": {
                    transform: 'rotate(360deg)',
                    transition: "transform 1s"
                },
                transition: "transform 1s",
                height: '200px',
                display: "flex",
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            }
        },
        '.footer': {
            height: '%height(35)',
            position: 'absolute',
            width: '100%',
            bottom: 0,
            display: "flex",
            alignItems: 'center',
            backgroundColor: 'green',
            color: 'white',
            justifyContent: 'center'
        }
    }
    ndom(struct.container, {
        styled: {
            height: function(pre) {
                return window.innerHeight * parseInt(pre) / 100 + "px";
            },
            width: function(size) {
                return window.innerWidth * parseInt(size) / 100 + "px";
            }
        },
        style: globalStyle,
        parse: {
            '.header': {
                html: ndom(struct.header, {
                    parse: {
                        '.item': {
                            data: {
                                item: ["专注", "专心", "专业"]
                            },
                            size: function() {
                                return this.item.length;
                            },
                            text: function() {
                                return this.dataGet('item')[this.index]
                            }
                        }
                    }
                })
            },
            '.content': {
                html: ndom(struct.content, {
                    parse: {
                        div: {
                            classList: ['text'],
                            i: 0,
                            data: {
                                text: "Hello",
                                val: ["ALL IN ", "CSS SELECTOR LIKE", "FREEDOM", "NEW FRAMEWORK"]
                            },
                            html: function() {
                                var _this = this;
                                var val = _this.dataGet('val');
                                var vt = _this.virtual;
                                setTimeout(function() {
                                    _this.virtual.i++;
                                    _this.dataSet('text', val[vt.i % val.length]);
                                }, 1500)
                                return ndom('a{' + _this.dataSet('text', val[vt.i % val.length]) + " N-DOM" + '}', {
                                    parse: {
                                        a: {
                                            attributes: {
                                                href: "https://github.com/donghui1993/ndom"
                                            }
                                        }
                                    }
                                }).html();
                            }
                        }
                    }
                })
            },
            '.footer': {
                data: {
                    text: "拨云见日 -- N-DOM"
                },
                text: function() {
                    return this.dataGet('text')
                }
            }
        }
    }, document.body);
}()
