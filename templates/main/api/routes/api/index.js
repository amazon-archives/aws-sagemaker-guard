var _=require('lodash')
var util=require('../util')
var fs=require('fs')
var attachment=require('./attachment')
var schema=require('../../../clouddir/schema')
var handlebars=require('handlebars')

module.exports=Object.assign(
    _.fromPairs([
        [
            "Collection",
            util.resource('{type}',{"Ref":"ApiResource"})
        ],
        [
            "CollectionGet",
            util.lambda({
                resource:{"Ref":"Collection"},
                method:"GET",
                lambda:"APICloudDirectoryIndexListLambda",
                req:fs.readFileSync(`${__dirname}/templates/list.req.vm`,'utf-8'),
                res:file("list.res.vm",{
                    users:JSON.stringify(require('../../../clouddir/user')),
                    groups:JSON.stringify(require('../../../clouddir/group')),
                    instances:JSON.stringify(require('../../../clouddir/instance'))
                }),
                parameter:{
                    locations:{
                        "method.request.querystring.NextToken":false,
                        "method.request.querystring.MaxResults":false,
                        "method.request.querystring.Query":false,
                    }
                }
            })
        ],
        [
            "CollectionPost",
            util.lambda({
                resource:{"Ref":"Collection"},
                defaultResponse:201,
                method:"POST",
                lambda:"APIRouterLambda",
                req:fs.readFileSync(`${__dirname}/templates/create.req.vm`,'utf-8'),
                res:fs.readFileSync(`${__dirname}/templates/create.res.vm`,'utf-8')
            }),
        ],
        [
            "CollectionOptions",
            util.mock({
                method:"OPTIONS",
                resource:{"Ref":"Collection"},
                templateString:"{}",
                responseParameters:{
                    "method.response.header.Allow":"'OPTIONS, GET, POST'"
                }
            })
        ],
        [
            "Item",
            util.resource('{id}',{"Ref":"Collection"})
        ],
        [
            "ItemPut",
            util.lambda({
                resource:{"Ref":"Item"},
                method:"PUT",
                lambda:"APIRouterLambda",
                req:fs.readFileSync(`${__dirname}/templates/update.req.vm`,'utf-8'),
                res:fs.readFileSync(`${__dirname}/templates/update.res.vm`,'utf-8')
            })
        ],
        [
           "ItemGet",
           util.lambda({
                resource:{"Ref":"Item"},
                method:"GET",
                lambda:"APIRouterLambda",
                req:fs.readFileSync(`${__dirname}/templates/get.req.vm`,'utf-8'),
                res:file("get.res.vm",{
                    users:update(require('../../../clouddir/user')),
                    groups:update(require('../../../clouddir/group')),
                    instances:update(require('../../../clouddir/instance'))
                })
            })
        ],
        [
            "ItemDelete",
            util.lambda({
                defaultResponse:204,
                resource:{"Ref":"Item"},
                method:"Delete",
                lambda:"APIRouterLambda",
                req:fs.readFileSync(`${__dirname}/templates/delete.req.vm`,'utf-8'),
                res:fs.readFileSync(`${__dirname}/templates/delete.res.vm`,'utf-8')
            })
        ],
        [
            "ItemOptions",
            util.lambda({
                resource:{"Ref":"Item"},
                type:"AWS_PROXY",
                method:"OPTIONS",
                lambda:"APIOptionsLambda"
            })
        ],
        [
            "ChildrenOrParents",
            util.resource('{childrenOrParents}',{"Ref":"Item"})
        ]
    ]),
    Object.assign(
        attachment({
            root:{"Ref":"ChildrenOrParents"},
        })
    )
)


function file(name,opts={}){
    var raw=fs.readFileSync(`${__dirname}/templates/${name}`,'utf-8')
    var temp=handlebars.compile(raw)
    return temp(opts)
}

function update(schema){
    var properties=schema.properties
    schema.properties=_.fromPairs(_.toPairs(properties)
    .filter(x=>!x[1].immutable))
    return JSON.stringify(schema)
}
