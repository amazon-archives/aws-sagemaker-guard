var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    var params={
        DirectoryArn:process.env.DIRECTORY,
        ObjectReference:{
            Selector:`\$${event.ID}`
        },
        FilterTypedLink:{
            SchemaArn:process.env.APPLIEDSCHEMAARN,
            TypedLinkName:"Attachment"
        },
        MaxResults:event.MaxResults || 10
    }
    
    start=cd.listIncomingTypedLinks(params).promise()
    
    start.then(response=>{
        if(!event.links){
            event.links=[]
        }
        event.links=event.links.concat(response.LinkSpecifiers)
        event.next=response.NextToken ? response.NextToken : false
        callback(null,event)
    })
}
