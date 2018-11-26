var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var step=new aws.StepFunctions()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    try{
        if(params[event.RequestType]){
            step.startExecution({
                stateMachineArn:params[event.RequestType],
                input:JSON.stringify(event)
            }).promise()
        }else{
            response.send(event, context, response.SUCCESS)
        }
    }catch(e){
        console.log(e)
        response.send(event, context, response.FAILED)
    }
}   
