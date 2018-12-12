var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var sagemaker=new aws.SageMaker()
var lambda=new aws.Lambda()
var firehose=new aws.Firehose()
var cf=new aws.CloudFormation()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    lambda.invoke({
        FunctionName:event.stageVariables.APIInstanceGetLambda,
        InvocationType:"RequestResponse",
        Payload:JSON.stringify({
            FunctionName:event.stageVariables.APICloudDirectoryObjectGetLambda,
            ID:event.pathParameters.id,
            Type:"instances"
        })
    }).promise()
    .then(result=>{
        console.log(JSON.stringify(result,null,2))
        if(result.FunctionError){
            throw JSON.parse(JSON.parse(result.Payload).errorMessage)
        }else{
            var data=JSON.parse(result.Payload)
            var stackname=data.attributes.StackName
        }
        return cf.describeStacks({
            StackName:stackname
        }).promise()
        .then(result=>{
            console.log(JSON.stringify(result,null,2))
            var NotebookInstanceName=result.Stacks[0].Outputs
                .filter(x=>x.OutputKey==="NoteBookName")[0].OutputValue

            return sagemaker.describeNotebookInstance({
                NotebookInstanceName
            }).promise()
            .then(y=>{
                return sagemaker.createPresignedNotebookInstanceUrl({
                    NotebookInstanceName
                }).promise()
                .then(x=>{
                    return x.AuthorizedUrl
                })
            })
        })
    })
    .then(url=>{
        return firehose.putRecord({
            DeliveryStreamName:process.env.LOGINFIREHOSE,
            Record:{
                Data:JSON.stringify({
                    UserName:event.requestContext.authorizer.principalId,
                    InstanceName:event.requestContext.authorizer.InstanceName,
                    "Date":event.requestContext.requestTimeEpoch,
                    IP:event.requestContext.identity.sourceIp,
                    UserAgent:event.requestContext.identity.userAgent,
                    RequestId:event.requestContext.requestId,
                })
            }
        }).promise()
        .then(()=>callback(null,{
            statusCode:307,
            headers:{
                Location:url
            }
        }))
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

