var _=require('lodash')
var util=require('../util')
var handlebars=require('handlebars')
var fs=require('fs')
var schema=require('../../../clouddir/schema')

module.exports={
    "RootGet":util.mock({
        method:"Get",
        auth:"NONE",
        resource:{"Fn::GetAtt": ["API","RootResourceId"]},
        template:`${__dirname}/root.vm`
    }),
    "ApiResource":util.resource('api'),
    "ApiResourceGet":util.mock({
        method:"Get",
        auth:"NONE",
        resource:{"Ref":"ApiResource"},
        template:`${__dirname}/api.vm`
    })
}

function file(name,opts={}){
    var raw=fs.readFileSync(`${__dirname}/${name}`,'utf-8')
    var temp=handlebars.compile(raw)
    return temp(opts)
}
