var aws=require('aws-sdk')
var response = require('cfn-response')
var CfnLambda = require('cfn-lambda');
aws.config.region=process.env.AWS_REGION
var _=require('lodash')
var ec2=new aws.EC2()
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()
var updateable=["AcceleratorTypes","InstanceType","RoleArn","VolumeSizeInGB","AdditionalCodeRepositories","DefaultCodeRepository"]

exports.handler=CfnLambda({
    Create:(params,reply)=>{
        params.VolumeSizeInGB=parseInt(params.VolumeSizeInGB)
        
        return sagemaker.createNotebookInstance(params).promise()
        .then(result=>reply(null,params.NotebookInstanceName,params))
        .catch(reply)
    },
    Update:(id,params,old,reply)=>{
        params.VolumeSizeInGB=parseInt(params.VolumeSizeInGB)
        old.VolumeSizeInGB=parseInt(old.VolumeSizeInGB)

        if(!_.isEqual(_.pick(params,updateable),_.pick(old,updateable))){
            return sagemaker.updateNotebookInstance(
                _.pick(params,updateable.concat(['NotebookInstanceName'])) 
            ).promise()
            .then(()=>reply(null,id,params))
            .catch(reply)
        }else{
            return sagemaker.describeNotebookInstance({
                NotebookInstanceName:id
            }).promise()
            .then(()=>reply(null,id,params))
            .catch(reply)
        }
    },
    NoUpdate:(id,params,reply)=>{
        return sagemaker.describeNotebookInstance({
            NotebookInstanceName:id
        }).promise()
        .then(x=>reply(null,id,x))
        .catch(reply)
    },
    Delete:(id,params,reply)=>{
        sagemaker.describeNotebookInstance({
            NotebookInstanceName:id
        }).promise()
        .then(x=>{
            if(x.NotebookInstanceStatus==="InService"){
                return sagemaker.stopNotebookInstance({
                    NotebookInstanceName:id
                }).promise()
                .then(x=>reply(null,id,x))
            }else if(["Stopped","Stoping"].includes(x.NotebookInstanceStatus)){
                reply(null,id,x)
            }else {
                reply(x)
            }
        })
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
                    }else if(["Failed","Stopped"].includes(x.NotebookInstanceStatus)){
                        sagemaker.deleteNotebookInstance({
                            NotebookInstanceName:id
                        }).promise()
                        .then(x=>recurse())
                        .catch(reply)
                    }else{
                        reply(x)
                    }
                })
                .catch(e=>{
                    if(e.message==="RecordNotFound"){
                        var eni=context.Data.NetworkInterfaceId
                        ec2.describeNetworkInterfaces({
                            NetworkInterfaceIds:[eni]
                        }).promise()
                        .then(x=>ec2.deleteNetworkInterface({
                            NetworkInterfaceId:eni
                        }).promise())
                        .then(x=>recurse())
                        .catch(x=>{
                            if(x.code==="InvalidNetworkInterfaceID.NotFound"){ 
                                reply(null,id)
                            }else{
                                reply(x)
                            }
                        })
                    }else{
                        sagemaker.deleteNotebookInstance({
                            NotebookInstanceName:id
                        }).promise()
                        .then(x=>recurse())
                        .catch(reply)
                    }
                })
            }
        }
    }
})
