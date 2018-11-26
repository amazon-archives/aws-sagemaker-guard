var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    if(typeof(event.object.policy_document)!=='undefined'){
        cd.listPolicyAttachments({
            DirectoryArn:process.env.DIRECTORY,
            PolicyReference:{
                Selector:`\$${event.ID}`
            },
            MaxResults:10
        }).promise()
        .then(x=>{
            var ids=x.ObjectIdentifiers
            event.policyLinks=ids
            event.next=x.NextToken ? x.NextToken : false
            callback(null,event)
        })    
    }else{
        event.next=null
        event.policyLinks=[]
        callback(null,event)
    }
}
