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
        callback(null,out)
    })
}
