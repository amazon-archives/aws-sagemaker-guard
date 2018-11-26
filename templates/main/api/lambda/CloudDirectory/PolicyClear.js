var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    
    cd.listPolicyAttachments({
        DirectoryArn:process.env.DIRECTORY,
        PolicyReference:{
            Selector:`\$${event.ID}`
        },
        MaxResults:10
    }).promise()
    .then(x=>{
        var ids=x.ObjectIdentifiers

        var links=ids.map(x=>{
            return {
                DetachPolicy:{
                    ObjectReference:{Selector:x},
                    PolicyReference:{Selector:event.ID}
                }
            }
        })
        if(ids.length){
            return cd.batchWrite({
                DirectoryArn:process.env.DIRECTORY,
                Operations:links
            }).promise()
            .then(()=>lambda.invoke({
                FunctionName:process.env.AWS_LAMBDA_FUNCTION_NAME,
                InvocationType:"Event",
                Payload:JSON.stringify(event)
            }).promise())  
        }
    })
    .then(response=>{
        callback(null,{
            ID:event.ID
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
