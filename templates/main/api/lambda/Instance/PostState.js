var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var sagemaker=new aws.SageMaker()
var lambda=new aws.Lambda()
var _=require('lodash')
var cf=new aws.CloudFormation()
var ssm=new aws.SSM()

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
        .then(x=>{
            if(["CREATE_COMPLETE","ROLLBACK_COMPLETE","UPDATE_COMPLETE","UPDATE_ROLLBACK_COMPLETE"].includes(x.Stacks[0].StackStatus)){
                var Parameters=_.fromPairs(x.Stacks[0].Parameters
                        .map(y=>[y.ParameterKey,y.ParameterValue]))
                
                Parameters.State=body.state.toUpperCase()
               
                return cf.updateStack({
                    StackName:result.attributes.StackName,
                    Capabilities:["CAPABILITY_NAMED_IAM"],
                    UsePreviousTemplate:true,
                    Parameters:_.toPairs(Parameters).map(y=>{return{
                        ParameterKey:y[0],
                        ParameterValue:y[1]
                    }})
                }).promise()
                .catch(error=>{
                    if(error.message!=="No updates are to be performed."){
                        throw error
                    }
                })
            }else{
                throw new Error(`Stack currently in state ${x.Stacks[0].StackStatus}`)
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

