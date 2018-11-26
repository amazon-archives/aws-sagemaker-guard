var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()

exports.handler=function(event,context,callback){

    return lambda.invoke({
        FunctionName:event.FunctionName,
        InvocationType:"RequestResponse",
        Payload:JSON.stringify(event)
    }).promise()
    .then(result=>{
        console.log(JSON.stringify(result,null,2))
        if(result.FunctionError){
            throw JSON.parse(JSON.parse(result.Payload).errorMessage)
        }else{
            return result
        }
    })
    .then(result=>{
        var NotebookInstanceName=`SageGuard-${event.ID}`
        return sagemaker.describeNotebookInstance({
            NotebookInstanceName
        }).promise()
        .then(function(info){
            Object.assign(result.attributes,info)
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
