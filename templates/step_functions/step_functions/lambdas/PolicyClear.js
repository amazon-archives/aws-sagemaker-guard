var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    var ids=event.policyLinks

    var links=ids.map(x=>{
        return {
            DetachPolicy:{
                ObjectReference:{Selector:`\$${x}`},
                PolicyReference:{Selector:`\$${event.ID}`}
            }
        }
    })
    if(ids.length){
        return cd.batchWrite({
            DirectoryArn:process.env.DIRECTORY,
            Operations:links
        }).promise()
        .then(()=>callback(null,event))
    }else{
        callback(null,event)
    }
}
