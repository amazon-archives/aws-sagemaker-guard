var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var sagemaker=new aws.SageMaker()
var lambda=new aws.Lambda()
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
            var body=JSON.parse(event.body)    
            if(body.state==="on"){
                return sagemaker.startNotebookInstance({
                    NotebookInstanceName
                }).promise()
            }else if(body.state==="off"){
                return sagemaker.stopNotebookInstance({
                    NotebookInstanceName
                }).promise()
            }
        })
    })
    .then(body=>{
        console.log(body)
        var href=`https://${event.requestContext.apiId}.execute-api.${event.stageVariables.Region}.amazonaws.com/${event.requestContext.path}`
        callback(null,{
            statusCode:200,
            body:JSON.stringify({
                collection:{
                    version:"1.0",
                    href:href,
                    links:[],
                    items:[{
                        href:href,
                        links:[]
                    }]
                }
            })
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

