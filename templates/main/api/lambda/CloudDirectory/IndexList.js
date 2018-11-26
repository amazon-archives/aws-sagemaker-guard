var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    return cd.listIndex({
        DirectoryArn:process.env.DIRECTORY,
        IndexReference: { 
            Selector:`/index/${event.Type}`
        },
        MaxResults:event.MaxResults || 10,
        NextToken:event.NextToken || null,
        ConsistencyLevel:"SERIALIZABLE",
        RangesOnIndexedValues:[{
            AttributeKey: {
                FacetName:event.Type, 
                Name: 'ID', 
                SchemaArn:process.env.SCHEMA 
            },
            Range:event.Query ? {
                StartMode:"INCLUSIVE",
                EndMode:"EXCLUSIVE",
                StartValue:{
                    StringValue:event.Query
                },
                EndValue:{
                    StringValue:next(event.Query)
                }
            }:{
                StartMode:"FIRST",
                EndMode:"LAST"
            }
        }]
    }).promise()
    .then(response=>{
        response.PrevToken=encodeURIComponent(event.NextToken || "null")
        response.NextToken=encodeURIComponent(response.NextToken || "null")
        response.Type=event.Type
        console.log(JSON.stringify(response,null,2))
        callback(null,response)
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
function next(string){                                                                      
    var len=string.length
    var last=string.charCodeAt(len-1)+1
    return string.substring(0,len-1)+String.fromCharCode(last)
}
   
