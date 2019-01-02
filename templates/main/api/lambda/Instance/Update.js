var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()
var _=require('lodash')
var cf=new aws.CloudFormation()
var updateable=["DisplayName","Description","IdleShutdown","OnTerminateDocument","OnStopDocument"]

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    
    return lambda.invoke({
        FunctionName:event.GetFunctionName,
        InvocationType:"RequestResponse",
        Payload:JSON.stringify(event)
    }).promise()
    .then(result=>{
        console.log(JSON.stringify(result,null,2))
        if(result.FunctionError){
            throw JSON.parse(JSON.parse(result.Payload).errorMessage)
        }else{
            return JSON.parse(result.Payload)
        }
    })
    .then(result=>{
        return cf.describeStacks({
            StackName:result.attributes.StackName,
        }).promise()
        .then(x=>{
            if(_.xor(_.keys(event.Attributes),updateable).length){
                return 
            }else if(x.Stacks[0].StackStatus.match(/_COMPLETE/)){
                var Parameters=x.Stacks[0].Parameters.map(y=>{
                    if(result.attributes[y.ParameterKey]){
                        y.ParameterValue=result.attributes[y.ParameterKey]
                    }
                    return y
                })
                return cf.updateStack({
                    StackName:result.attributes.StackName,
                    Capabilities:["CAPABILITY_NAMED_IAM"],
                    UsePreviousTemplate:true,
                    Parameters
                }).promise()
                .catch(error=>{
                    if(error.message!=="No updates are to be performed."){
                        throw error
                    }
                })
            }else{
                throw new Error(`Stack currently in state ${x.Stacks[0].StackStatus}`)
            }
        })
    })
    .then(response=>{
        return lambda.invoke({
            FunctionName:event.FunctionName,
            InvocationType:"RequestResponse",
            Payload:JSON.stringify(event)
        }).promise()
    })
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
