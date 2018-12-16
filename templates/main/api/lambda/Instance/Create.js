var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var validate=require('lambda').validate
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()
var step=new aws.StepFunctions()
var wait=require('wait')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    if(event.Attributes.SecurityGroupIds){
        event.Attributes.SecurityGroupIds=event.Attributes.SecurityGroupIds.join(',')
    }

    step.startExecution({
        stateMachineArn:process.env.STATEMACHINECREATEINSTANCE,
        input:JSON.stringify(event)
    }).promise()
    .then(x=>wait(process.env.API,event.Type,event.Attributes.ID))
    .then(x=>callback(null,x))
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
