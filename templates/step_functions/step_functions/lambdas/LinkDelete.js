var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    links=event.links.map(x=>{return {DetachTypedLink:{TypedLinkSpecifier:x}}})
    if(links.length>0){
        return cd.batchWrite({
            DirectoryArn:process.env.DIRECTORY,
            Operations:links
        }).promise()
        .then(response=>{
            console.log(response)
            event.links=[]
            callback(null,event)
        })
    }else{
        callback(null,event)
    }
}
