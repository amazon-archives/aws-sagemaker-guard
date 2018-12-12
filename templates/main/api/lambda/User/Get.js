var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    lambda.invoke({
        FunctionName:event.FunctionName,
        InvocationType:"RequestResponse",
        Payload:JSON.stringify(event)
    }).promise().then(validate)
    .then(result=>{
        lambda.invoke({
            FunctionName:process.env.ESPROXY,
            InvocationType:"RequestResponse",
            Payload:JSON.stringify({
                 "endpoint":process.env.ESADDRESS,
                 "path":"/logins-*/_search",
                 "method":"GET",
                 "body":{
                     "query":{
                         "match":{
                             "requestContext.authorizer.principalId":result.attributes.ID
                         }
                     },
                     "sort":[{
                        "requestContext.requestTimeEpoch":{
                            "order":"desc"
                        }
                     }]
                 }  
            })
        }).promise().then(validate)
        .then(es=>{
            if(es.hits.total>0){
                return Promise.all(es.hits.hits.map(x=>lambda.invoke({
                    FunctionName:event.FunctionName,
                    InvocationType:"RequestResponse",
                    Payload:JSON.stringify({
                        ID:x._source.requestContext.authorizer.InstanceName,
                        Type:"instances"
                    })
                }).promise().then(validate)
                .then(y=>`${y.attributes.ID} ${x._source.requestContext.requestTime}`)))
                .then(x=>result.attributes["Last Logins"]=x)
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
