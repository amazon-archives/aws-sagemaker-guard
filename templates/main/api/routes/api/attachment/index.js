var _=require('lodash')
var util=require('../../util')
var handlebars=require('handlebars')
var fs=require('fs')

module.exports=function(opts){
    var collection=`AttachedCollection`
    var item=`AttachedItem`

    return _.fromPairs([
        [
            collection,
            util.resource(`{subCollection}`,opts.root)
        ],
        [
            `${collection}Options`,
            util.mock({
                method:"OPTIONS",
                resource:{"Ref":collection},
                templateString:"{}",
                responseParameters:{
                    "method.response.header.Allow":"'OPTIONS, GET, PUT'"
                }
            })
        ],
        [
            item,
            util.resource(`{subItem}`,{"Ref":collection})
        ],
        [
            `${item}Options`,
            util.mock({
                method:"OPTIONS",
                resource:{"Ref":item},
                templateString:"{}",
                responseParameters:{
                    "method.response.header.Allow":"'OPTIONS, DELETE'"
                }
            })
        ],
        [
            `${collection}Get`,
            util.lambda({
                resource:{"Ref":collection},
                method:"Get",
                lambda:"APIRouterLambda",
                req:file('list.req.vm',opts),
                res:file('list.res.vm',opts),
                parameters:{
                    locations:{
                        "method.request.querystring.NextToken":false,
                        "method.request.querystring.Query":false,
                        "method.request.querystring.MaxResults":false,
                    }
                }
            })
        ],
        [
            `${collection}Post`,
            util.lambda({
                resource:{"Ref":collection},
                method:"Post",
                lambda:"APIRouterLambda",
                defaultResponse:201,
                req:file('create.req.vm',{val:[
                    ["groups","groups"],
                    ["users","groups"],
                    ["instances","groups"],
                    ["instances","users"]
                ]}),
                res:file('create.res.vm',opts)
            })
        ],
        [
            `${item}Delete`,
            util.lambda({
                resource:{"Ref":item},
                method:"Delete",
                defaultResponse:204,
                lambda:"APIRouterLambda",
                req:file('delete.req.vm',opts),
                res:file('delete.res.vm',opts)
            })
        ],
        [
           `${item}Get`,
           util.lambda({
                resource:{"Ref":item},
                method:"GET",
                lambda:"APIRouterLambda",
                req:fs.readFileSync(`${__dirname}/get.req.vm`,'utf-8'),
                res:fs.readFileSync(`${__dirname}/get.res.vm`,'utf-8'),
            })
        ]
    ])
}

function file(name,opts={}){
    var raw=fs.readFileSync(`${__dirname}/${name}`,'utf-8')
    var temp=handlebars.compile(raw)
    return temp(opts)
}

