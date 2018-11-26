var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    lambda.invoke({
        FunctionName:event.FunctionName,
        InvocationType:"RequestResponse",
        Payload:JSON.stringify(event.Payload)
    }).promise()
    .then(result=>{
        console.log(JSON.stringify(result,null,2))
        if(result.FunctionError){
            callback(JSON.parse(result.Payload).errorMessage)
        }else{
            callback(null,JSON.parse(result.Payload))
        }
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
