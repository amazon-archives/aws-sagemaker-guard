var _=require('lodash')

exports.isAdmin=function(event){
    var groups=event.requestContext.authorizer.claims["cognito:groups"]
    var view=_.get(event,"queryStringParameters.view","Users")
    var valid=groups===view 

    return valid ? view : "Users"
}

exports.encode=function(obj){
    return Buffer.from(JSON.stringify(obj)).toString('base64')
}

exports.decode=function(string){
    return JSON.parse(Buffer.from(string, 'base64').toString('ascii'))
}

exports.opts=function(event){
    var opts={}
    
    opts.view=_.get(event,"queryStringParameters.view","Users")
    opts.token=_.get(event,"queryStringParameters.NextToken")
    opts.base=`https://${event.requestContext.domainPrefix}.execute-api.${event.stageVariables.Region}.amazonaws.com/${event.requestContext.stage}`
    opts.href=`${base}/${event.requestContext.path}`
    opts.admin=exports.isAdmin(event)
    opts.id=event.requestContext.authorizer.claims["cognito:username"]
    opts.TableName=process.env.INSTANCEREQUESTTABLE
    opts.item=event.body ? JSON.parse(event.body).template.data : null
    console.log(JSON.stringify(opts,null,2))
    return opts
}
