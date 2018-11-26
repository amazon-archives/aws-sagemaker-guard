var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    Promise.all([{
        FunctionName:event.ListAttachments,
        InvocationType:"RequestResponse",
        Payload:JSON.stringify({
            ID:event.ID,
            ChildrenOrParents:"children"
        })
    },{
        FunctionName:event.ListAttachments,
        InvocationType:"RequestResponse",
        Payload:JSON.stringify({
            ID:event.ID,
            ChildrenOrParents:"parents"
        })
    }]
    .map(x=>lambda.invoke(x).promise()))
    .then(results=>{
        console.log(results)
        return results.map(y=>{
            if(y.FunctionError){
                console.log(JSON.parse(y.Payload))
                throw JSON.parse(JSON.parse(y.Payload).errorMessage)
            }else{
                return JSON.parse(y.Payload)
            }
        })
    })
    .then(results=>{
        console.log(JSON.stringify(results,null,2))
        links=results[0].Links.concat(results[1].Links)
            .map(x=>{return {DetachTypedLink:x}} )
            .slice(10)

        return cd.batchWrite({
            DirectoryArn:process.env.DIRECTORY,
            Operations:links
        }).promise()
        .then(()=>lambda.invoke({
            FunctionName:process.env.AWS_LAMBDA_FUNCTION_NAME,
            InvocationType:"Event",
            Payload:JSON.stringify(event)
        }).promise())
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
