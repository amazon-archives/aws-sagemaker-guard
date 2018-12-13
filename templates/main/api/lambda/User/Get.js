var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cognito=new aws.CognitoIdentityServiceProvider()
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    lambda.invoke({
        FunctionName:event.FunctionName,
        InvocationType:"RequestResponse",
        Payload:JSON.stringify(event)
    }).promise().then(validate)
    .then(result=>{
        Promise.all([
            lambda.invoke({
                FunctionName:process.env.ESPROXY,
                InvocationType:"RequestResponse",
                Payload:JSON.stringify({
                     "endpoint":process.env.ESADDRESS,
                     "path":"/logins-*/_search",
                     "method":"GET",
                     "body":{
                         "size":4,
                         "query":{
                             "term":{
                                 "UserName":result.attributes.ID
                             }
                         },
                         "sort":[{
                            "Date":{
                                "order":"desc"
                            }
                         }]
                     }  
                })
            }).promise().then(validate),
            cognito.adminListUserAuthEvents({
                UserPoolId:event.UserPool,
                Username:result.attributes.ID,
                MaxResults:4
            }).promise()
        ])
        .then(results=>{
            var es=results[0]
            var cog=results[1]
            if(es.hits.total>0){
                return Promise.all(es.hits.hits.map(x=>lambda.invoke({
                    FunctionName:event.FunctionName,
                    InvocationType:"RequestResponse",
                    Payload:JSON.stringify({
                        ID:x._source.InstanceName,
                        Type:"instances"
                    })
                }).promise().then(validate)
                .then(y=>`${y.attributes.ID} ${x._source.Date}`)))
                .then(x=>result.attributes["Last Logins"]=x)
            }
            if(cog.AuthEvents.length>0){
                result.attributes["Login events"]=cog.AuthEvents
                    .map(x=>`${x.CreationDate}:${x.EventType} ${x.EventResponse}:${x.EventRisk.RiskLevel || ""}`)
            }
        })
        .then(()=>{
            callback(null,Object.assign(
                {attributes:result.attributes},
                event
            ))
        })
    })
    .catch(error=>{
        console.log(error)
        callback(JSON.stringify({
            type:error.statusCode===404 ? "[NotFoud]" : "[InternalServiceError]",
            status:error.statusCode,
            message:error.message,
            data:error
        }))
    })
}

function validate(result){
    console.log(JSON.stringify(result,null,2))
    if(result.FunctionError){
        throw JSON.parse(JSON.parse(result.Payload).errorMessage)
    }else{
        return JSON.parse(result.Payload)
    }
}
