var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()
var step=new aws.StepFunctions()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    if(event.Attributes.SecurityGroupIds){
        event.Attributes.SecurityGroupIds=event.Attributes.SecurityGroupIds.join(',')
    }

    step.startExecution({
        stateMachineArn:process.env.STATEMACHINECREATEINSTANCE,
        input:JSON.stringify(event)
    }).promise()
    .then(result=>{
        console.log(JSON.stringify(result,null,2))
        if(result.FunctionError){
            throw JSON.parse(JSON.parse(result.Payload).errorMessage)
        }else{
            callback(null,event)
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
