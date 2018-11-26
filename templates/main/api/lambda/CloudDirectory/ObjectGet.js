var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    cd.listObjectAttributes({
        DirectoryArn:process.env.DIRECTORY,
        ObjectReference:{
            Selector:`\$${event.ID}`
        },
    }).promise()
    .then(response=>{
        var out={}
        response.Attributes.forEach(function(x){
            out[x.Key.Name]=x.Value.StringValue
        })
        console.log(JSON.stringify(out,null,2))
        callback(null,Object.assign(
            {attributes:out},event
        ))
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
