var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    cd.lookupPolicy({
        DirectoryArn:process.env.DIRECTORY,
        ObjectReference:{
            Selector:event.ID ? `\$${event.ID}` : event.path
        },
        MaxResults:3,
        NextToken:event.NextToken || null,
    }).promise()
    .then(response=>{
        console.log(JSON.stringify(response,null,2))

        var tmp=[].concat.apply([],
            response.PolicyToPathList
                .map(x=>x.Policies.filter(y=>y.PolicyId).map(y=>{return {
                    id:y.PolicyId, 
                    direct:y.ObjectIdentifier===event.ID,
                }}))
            )
            .reduce((a,b)=>{
                a[b.id]=(a[b.id] || b.direct)
                return a
            },{})
        console.log(tmp)   
        var Links=Object.keys(tmp).map(x=>{return {
            id:x,
            direct:tmp[x]
        }})
        console.log(Links)
        callback(null,Object.assign({
            NextToken:response.NextToken,
            Links:Links.map(x=>{return{
                TargetObjectReference:{Selector:`#${x.id}`},
                direct:x.direct
            }})
            },event
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
