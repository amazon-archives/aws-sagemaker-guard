var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var sagemaker=new aws.SageMaker()
var validate=require('lambda').validate
var _=require('lodash')
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
    .then(validate)
    .then(data=>{
        console.log(JSON.stringify(data,null,2))
        var stackname=data.attributes.StackName
        
        return cf.describeStacks({
            StackName:stackname
        }).promise()
        .then(result=>{
            console.log(JSON.stringify(result,null,2))
            var outputs=_.fromPairs(result.Stacks[0].Outputs
                .map(x=>[x.OutputKey,x.OutputValue]))
            
            var NotebookInstanceName=outputs.NoteBookName

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
        .then(url=>{
            return firehose.putRecord({
                DeliveryStreamName:process.env.LOGINFIREHOSE,
                Record:{
                    Data:JSON.stringify(Object.assign({
                        UserName:event.requestContext.authorizer.principalId,
                        "Date":event.requestContext.requestTimeEpoch,
                        IP:event.requestContext.identity.sourceIp,
                        UserAgent:event.requestContext.identity.userAgent,
                        RequestId:event.requestContext.requestId,
                    },_.pick(data.attributes,
                        ["ID","CreationTime","DirectInternetAccess","InstanceID","InstanceType","NetworkInterfaceId","NoteBookName","RoleArn","SecurityGroups"])))
                }
            }).promise()
            .then(()=>callback(null,{
                statusCode:307,
                headers:{
                    Location:url
                }
            }))
        })
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

