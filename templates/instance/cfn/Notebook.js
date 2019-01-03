var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var _=require('lodash')
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()
var updateable=["AcceleratorTypes","InstanceType","RoleArn","VolumeSizeInGB","AdditionalCodeRepositories","DefaultCodeRepository"]

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken
    params.VolumeSizeInGB=parseInt(params.VolumeSizeInGB)
    try{
    if(!event.wait){
        if(event.RequestType==="Create"){
            sagemaker.createNotebookInstance(params).promise()
            .then(()=>recurse(event,callback,context))
            .catch(error(event,context))
        }else if(event.RequestType==="Update"){
            var old=event.OldResourceProperties
            delete old.ServiceToken
            
            if(!_.isEqual(_.pick(params,updateable),_.pick(old,updateable))){
                sagemaker.updateNotebookInstance(
                    _.pick(params,updateable.concat(['NotebookInstanceName'])) 
                ).promise()
                .then(()=>recurse(event,callback,context))
                .catch(error(event,context))
            }else{
                sagemaker.describeNotebookInstance({
                    NotebookInstanceName:params.NotebookInstanceName
                }).promise()
                .then(x=>{
                    response.send(event, context, response.SUCCESS,x,x.NotebookInstanceArn)
                })
                .catch(error(event,context))
            }
        }else{
            sagemaker.stopNotebookInstance({
                NotebookInstanceName:params.NotebookInstanceName
            }).promise()
            .catch(x=>{
                console.log(x)
                if(!x.message.match("Unable to transition")){
                    throw x
                }
            })
            .then(()=>recurse(event,callback,context))
            .catch(error(event))
        }
    }else{
        return sagemaker.describeNotebookInstance({
            NotebookInstanceName:params.NotebookInstanceName
        }).promise()
        .then(x=>{
            if(x.NotebookInstanceStatus==="InService"){
                response.send(event, context, response.SUCCESS,x,x.NotebookInstanceArn)
            }else if(x.NotebookInstanceStatus==="Pending"){
                recurse(event,callback)
            }else if(x.NotebookInstanceStatus==="Stopping"){
                recurse(event,callback)
            }else if(x.NotebookInstanceStatus==="Failed"){
                if(event.RequestType==="Delete"){
                    sagemaker.deleteNotebookInstance({
                        NotebookInstanceName:params.NotebookInstanceName
                    }).promise()
                    .then(x=>response.send(event, context, response.SUCCESS))
                    .catch(error(event))
                }else{
                    response.send(event, context, response.FAILED)
                }
            }else if(x.NotebookInstanceStatus==="Stopped"){
                sagemaker.deleteNotebookInstance({
                    NotebookInstanceName:params.NotebookInstanceName
                }).promise()
                .then(x=>response.send(event, context, response.SUCCESS))
                .catch(error(event))
            }else{
                console.log(x)
                response.send(event, context, response.FAILED)
            }
        })
    }
    }catch(e){
        console.log(e)
        callback(e)
    }
}
function recurse(event,callback,context){
    event.wait=true
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

function error(event,context){
    return function(error){
        console.log(error)
        response.send(event, context, response.FAILED)
    }
}
