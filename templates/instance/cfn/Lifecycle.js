var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var _=require('lodash')
var ssm=new aws.SSM()
var util=require('ssm')
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken

    if(event.RequestType===params.event){
        if(event.id){ //wait for SSM Command
            commandStatus(event)
            .then(status=>{
                if(status==="Success"){
                    delete event.id
                    return stopNotebook(event)
                    .then(()=>recurse(event,callback))
                    .catch(error=>{
                        console.log(error)
                        response.send(event, context, response.FAILED)
                    })
                }else if(["Pending","InProgress","Delayed"].includes(status)){
                    recurse(event,callback)
                }else{
                    response.send(event, context, response.FAILED)
                }
            })
            .catch(error=>{
                console.log(error)
                response.send(event, context, response.FAILED)
            })
        }else if(event.wait){ // wait for sagemaker state
            return sagemaker.describeNotebookInstance({
                NotebookInstanceName:process.env.NOTEBOOK
            }).promise()
            .then(x=>{
                var state=event.ResourceProperties.state
                if(state==="OFF" && x.NotebookInstanceStatus==="Stopped"){
                    response.send(event, context, response.SUCCESS)
                }else if(state==="ON" && x.NotebookInstanceStatus==="InService"){
                    response.send(event, context, response.SUCCESS)
                }else if(["Stopping","Pending"].includes(x.NotebookInstanceStatus)){
                    recurse(event,callback)
                }else if(x.NotebookInstanceStatus==="Failed"){
                    response.send(event, context, response.FAILED)
                }else{
                    response.send(event, context, response.FAILED)
                }
            })
        }else{ //Start
            startNotebook(event)
            .then(()=>{
                event.wait=true
                if(event.ResourceProperties.config.DocumentName!=="EMPTY"){
                    return util.start(event.ResourceProperties.config)
                    .then(x=>Object.assign(event,x))
                }else{
                    return stopNotebook(event)
                }
            })
            .then(()=>recurse(event,callback))
            .catch(error=>{
                console.log(error)
                response.send(event, context, response.FAILED)
            })
        }
    }else{  //event does not match
        response.send(event, context, response.SUCCESS)
    }
}
function recurse(event,callback){
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
}

function commandStatus(event){
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

        
function startNotebook(event){
    if(event.ResourceProperties.state==="ON"){
        return sagemaker.describeNotebookInstance({
            NotebookInstanceName:process.env.NOTEBOOK
        }).promise()
        .then(x=>{
            console.log(JSON.stringify(x,null,2))
            if(["Stopped"].includes(x.NotebookInstanceStatus)){
                return sagemaker.startNotebookInstance({
                    NotebookInstanceName:process.env.NOTEBOOK
                }).promise()
            } 
        })
    }else{
        return Promise.resolve()
    }
}
function stopNotebook(event){
    if(event.ResourceProperties.state==="OFF"){
        return sagemaker.describeNotebookInstance({
            NotebookInstanceName:process.env.NOTEBOOK
        }).promise()
        .then(x=>{
            console.log(JSON.stringify(x,null,2))
            if(["InService"].includes(x.NotebookInstanceStatus)){
                return sagemaker.stopNotebookInstance({
                    NotebookInstanceName:process.env.NOTEBOOK
                }).promise()
            } 
        })
    }else{
        return Promise.resolve()
    }
}
