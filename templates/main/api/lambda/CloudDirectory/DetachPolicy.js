var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    return cd.batchWrite({
        DirectoryArn:process.env.DIRECTORY,
        Operations:[{
            DetachTypedLink:{
                TypedLinkSpecifier:{
                    SourceObjectReference:{
                        Selector:`\$${event.SourceID}`
                    },
                    TargetObjectReference:{
                        Selector:`\$${event.TargetID}`
                    },
                    IdentityAttributeValues:Object.keys(event.Attributes).map(key=>{
                        return  {
                            AttributeName:key,
                            Value:{
                                StringValue:event.Attributes[key]
                            }
                        }
                    }),
                    TypedLinkFacet:{
                        SchemaArn:process.env.SCHEMA,
                        TypedLinkName:"Attachment"
                    }
                }
            }
        },{
            DetachPolicy:{
                ObjectReference:{
                    Selector:`\$${event.SourceID}`
                },
                PolicyReference:{
                    Selector:`\$${event.TargetID}`
                }
            }
        }]
    }).promise()
    .then(response=>{
        console.log(JSON.stringify(response,null,2))
        callback(null,event)
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
