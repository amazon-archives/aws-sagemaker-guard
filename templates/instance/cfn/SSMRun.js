var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var ssm=new aws.SSM()
var util=require('ssm')
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken

    if(event.RequestType===params.event){
        if(event.id){
            get(event)
            .then(status=>{
                if(status==="Success"){
                    response.send(event, context, response.SUCCESS)
                }else if(["Pending","InProgress","Delayed"].includes(status)){
                    setTimeout(()=>lambda.invoke({
                            FunctionName:process.env.AWS_LAMBDA_FUNCTION_NAME,
                            InvocationType:"Event",
                            Payload:JSON.stringify(event)
                        }).promise()
                        .catch(error=>{
                            console.log(error)
                            response.send(event, context, response.FAILED)
                        })
                        .then(()=>callback(null))
                    ,5000)
                }else{
                    response.send(event, context, response.FAILED)
                }
            })
            .catch(error=>{
                console.log(error)
                response.send(event, context, response.FAILED)
            })
        }else{
            util.start(event.ResourceProperties.config)
            .then(x=>Object.assign(event,x))
            .then(id=>{
                setTimeout(()=>lambda.invoke({
                        FunctionName:process.env.AWS_LAMBDA_FUNCTION_NAME,
                        InvocationType:"Event",
                        Payload:JSON.stringify(event)
                    }).promise()
                    .catch(error=>{
                        console.log(error)
                        response.send(event, context, response.FAILED)
                    })
                    .then(()=>callback(null))
                ,5000)
            })
            .catch(error=>{
                console.log(error)
                response.send(event, context, response.FAILED)
            })
        }
    }else{
        response.send(event, context, response.SUCCESS)
    }
}


function get(event){
    if(event.DocumentType==="Command"){
        return ssm.getCommandInvocation({
            CommandId:event.id,
            InstanceId:event.ResourceProperties.config.InstanceIds[0]
        }).promise()
        .then(x=>x.Status)
    }else{
        return ssm.describeAutomationExecutions({
            Filters:[{
                Key:"ExecutionId",
                Values:[event.id]
            }]
        }).promise()
        .then(x=>x.AutomationExecutionMetadataList[0].AutomationExecutionStatus)
    }
}

