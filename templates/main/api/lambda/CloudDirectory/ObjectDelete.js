var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()
var lambda=new aws.Lambda()
var wait=require('wait-delete')
var step=new aws.StepFunctions()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    step.startExecution({
        stateMachineArn:process.env.STATEMACHINECLEAROBJECT,
        input:JSON.stringify(event)
    }).promise()
    .then(()=>wait(process.env.API,event.Type,event.ID))
    .then(response=>{
        callback(null,{
            ID:event.ID
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
