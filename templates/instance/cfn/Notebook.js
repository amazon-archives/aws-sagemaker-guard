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

    if(!event.wait){
        if(event.RequestType==="Create"){
            event.wait=true
            sagemaker.createNotebookInstance(params).promise()
            .then(()=>recurse(event,callback))
            .catch(error(event))
        }else if(event.RequestType==="Update"){
            var old=event.OldResourceProperties
            delete old.ServiceToken
            
            if(!_.isEqual(_.pick(params,updateable),_.pick(old,updateable))){
                event.wait=true
                sagemaker.updateNotebookInstance(
                    _.pick(params,updateable.concat(['NotebookInstanceName'])) 
                ).promise()
                .then(()=>recurse(event,callback))
                .catch(error(event))
            }else{
                sagemaker.describeNotebookInstance({
                    NotebookInstanceName:params.NotebookInstanceName
                }).promise()
                .then(x=>{
                    response.send(event, context, response.SUCCESS,x,x.NotebookInstanceArn)
                })
                .catch(error(event))
            }
        }else{
            sagemaker.stopNotebookInstance({
                NotebookInstanceName:params.NotebookInstanceName
            }).promise()
            .catch(x=>{
                if(!x.message.match("Unable to transition")){
                    throw x
                }
            })
            .then(()=>recurse(event))
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
            }else if(x.NotebookInstanceStatus==="Failed"){
                response.send(event, context, response.FAILED)
            }else if(x.NotebookInstanceStatus==="Stopped"){
                sagemaker.deleteNotebookInstance({
                    NotebookInstanceName:params.NotebookInstanceName
                }).promise()
                .then(x=>response.send(event, context, response.SUCCESS))
                .catch(error(event))
            }else{
                response.send(event, context, response.FAILED)
            }
        })
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

function error(event){
    return function(error){
        console.log(error)
        response.send(event, context, response.FAILED)
    }
}
