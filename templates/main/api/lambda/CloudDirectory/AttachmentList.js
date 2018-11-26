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
            SchemaArn:process.env.SCHEMA,
            TypedLinkName:"Attachment"
        },
        MaxResults:event.MaxResults || 10
    }
    if(event.SourceType){
        params.FilterAttributeRanges=[{
            AttributeName:"SourceType",
            Range:{
                StartMode:"INCLUSIVE",
                EndMode:"INCLUSIVE",
                StartValue:{
                    StringValue:event.SourceType
                },
                EndValue:{
                    StringValue:event.SourceType
                }
            }
        },{
            AttributeName:"TargetType",
            Range:{
                StartMode:"INCLUSIVE",
                EndMode:"INCLUSIVE",
                StartValue:{
                    StringValue:event.TargetType
                },
                EndValue:{
                    StringValue:event.TargetType
                }
            }
        }]
    }
    if(event.NextToken){
        params.NextToken=event.NextToken
    }
    if(event.ChildrenOrParents==="children"){
        start=cd.listOutgoingTypedLinks(params).promise() 
    }else{     
        start=cd.listIncomingTypedLinks(params).promise()
    }
    
    start.then(response=>{
        console.log(JSON.stringify(response,null,2))
         if(event.ChildrenOrParents==="parents"){
            var out=response.LinkSpecifiers
        }else{    
            var out=response.TypedLinkSpecifiers
        }   
        callback(null,Object.assign(event,{
            Links:out.map(x=>{
                x.direct=true
                return x
            }),
            NextToken:encodeURIComponent(response.NextToken || "null"),
            search:out.length>0 || event.Query ? "true" : "false"
        }))
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
