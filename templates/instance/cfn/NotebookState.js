var aws=require('aws-sdk')
var response = require('cfn-response')
var CfnLambda = require('cfn-lambda');
aws.config.region=process.env.AWS_REGION
var _=require('lodash')
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()

exports.handler=CfnLambda({
    Create:(params,reply)=>{
        startNotebook(params)
        .then(x=>reply(null,params.notebook,params))
        .catch(reply)
    },
    Update:(id,params,old,reply)=>{
        reply(null,params.notebook,params)
    },
    Delete:(id,params,reply)=>{
        stopNotebook(params)
        .then(x=>reply(null,params.notebook,params))
        .catch(reply)
    },
    LongRunning:{
        PingInSeconds:5,
        MaxPings:100000,
        LambdaApi:lambda,
        Methods:{
            Create:(context,params,reply,recurse)=>{
                return sagemaker.describeNotebookInstance({
                    NotebookInstanceName:context.PhysicalResourceId
                }).promise()
                .then(x=>{
                    console.log(x)
                    if(x.NotebookInstanceStatus==="InService"){
                        reply(null,context.PhysicalResourceId,x)
                    }else if(x.NotebookInstanceStatus==="Pending"){
                        recurse()
                    }else {
                        console.log(x)
                        reply(x)
                    }
                })
                .catch(reply)
            },
            Delete:(context,id,params,reply,recurse)=>{
                return sagemaker.describeNotebookInstance({
                    NotebookInstanceName:id
                }).promise()
                .then(x=>{
                    if(x.NotebookInstanceStatus==="InService"){
                        recurse()
                    }else if(x.NotebookInstanceStatus==="Stopping"){
                        recurse()
                    }else if(x.NotebookInstanceStatus==="Stopped"){
                        reply(null,id,params)
                    }else{
                        console.log(x)
                        reply(x)
                    }
                })
            }
        }
    }
})

function startNotebook(params){
    return sagemaker.describeNotebookInstance({
        NotebookInstanceName:params.notebook
    }).promise()
    .then(x=>{
        console.log(JSON.stringify(x,null,2))
        if(["Stopped"].includes(x.NotebookInstanceStatus)){
            return sagemaker.startNotebookInstance({
                NotebookInstanceName:params.notebook
            }).promise()
        } 
    })
}
function stopNotebook(params){
    return sagemaker.describeNotebookInstance({
        NotebookInstanceName:params.notebook
    }).promise()
    .then(x=>{
        console.log(JSON.stringify(x,null,2))
        if(["InService"].includes(x.NotebookInstanceStatus)){
            return sagemaker.stopNotebookInstance({
                NotebookInstanceName:params.notebook
            }).promise()
        } 
    })
}
