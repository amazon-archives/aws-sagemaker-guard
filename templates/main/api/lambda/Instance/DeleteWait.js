var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var sagemaker=new aws.SageMaker()
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
            
    var NotebookInstanceName=`SageGuard-${event.attributes.ID}`
    sagemaker.describeNotebookInstance({
        NotebookInstanceName
    }).promise()
    .then(function(result){
        if(result.NotebookInstanceStatus==="InService"){
            return sagemaker.stopNotebookInstance({
                NotebookInstanceName
            }).promise()
            .then(()=>new Promise(function(res,rej){
                setTimeout(()=>{
                    lambda.invoke({
                        FunctionName:process.env.AWS_LAMBDA_FUNCTION_NAME, 
                        InvocationType: "Event", 
                        Payload:JSON.stringify(event), 
                    }).promise()
                    .then(res)
                    .catch(rej)
                },2000)
            }))
        }else if(result.NotebookInstanceStatus==="Stopped"){
            return sagemaker.deleteNotebookInstance({
                NotebookInstanceName
            }).promise()
            .then(()=>lambda.invoke({
                FunctionName:event.deleteParams.FunctionName,
                InvocationType:"Event",
                Payload:JSON.stringify(event.deleteParams)
            }).promise())
        }else if(result.NotebookInstanceStatus==="Stopping"){
            return new Promise(function(res,rej){
                setTimeout(()=>{
                    lambda.invoke({
                        FunctionName:process.env.AWS_LAMBDA_FUNCTION_NAME, 
                        InvocationType: "Event", 
                        Payload:JSON.stringify(event), 
                    }).promise()
                    .then(res)
                    .catch(rej)
                },2000)
            })
        }else{
            throw(result)
        }
    })
    .then(()=>callback(null))
    .catch(x=>{
        console.log(x)
        callback(x)
    })
}

