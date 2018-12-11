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

            return sagemaker.describeNotebookInstance({
                NotebookInstanceName
            }).promise()
            .then(y=>{
                if(y.NotebookInstanceStatus==="InService"){
                    return {
                        attributes:data.attributes,
                        url:`https://${event.requestContext.domainPrefix}.execute-api.${event.stageVariables.Region}.amazonaws.com${event.requestContext.path}/login?Auth=${event.headers.Authorization}`
                    }
                }else{
                    return {
                        attributes:data.attributes
                    }
                }
            })
        })
    })
    .then(body=>{
        console.log(body)
        var out={
            collection:{
                version:"1.0",
                href:href,
                links:[],
                items:[{
                    href:href,
                    links:[body.url ? {
                        href:body.url,
                        rel:"login"
                    } : null
                    ].filter(x=>x),
                    data:body.attributes
                }]
            }
        }
        var href=`https://${event.requestContext.apiId}.execute-api.${event.stageVariables.Region}.amazonaws.com/${event.requestContext.path}`
        
        if(body.attributes.NotebookInstanceStatus==="InService"){
            out.collection.template={
                data:{
                    schema:{
                        "type": "object",
                        properties:{
                            state:{
                                type:"string",
                                enum:["off"]
                            }
                        },
                        required:"state"
                    },
                    prompt:"Turn Instance Off"
                }
            }
        }else if(body.attributes.NotebookInstanceStatus==="Stopped"){
            out.collection.template={
                data:{
                    schema:{
                        "type": "object",
                        properties:{
                            state:{
                                type:"string",
                                enum:["on"]
                            }
                        },
                        required:"state"
                    },
                    prompt:"Turn Instance On"
                }
            }
        }
        callback(null,{
            statusCode:200,
            body:JSON.stringify(out)
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

