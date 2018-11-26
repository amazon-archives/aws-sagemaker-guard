var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    cd.listFacetAttributes({
        Name:event.Type,
        SchemaArn:process.env.SCHEMA
    }).promise()
    .then(function(result){
        console.log(JSON.stringify(result,null,2))
        var attributes=result.Attributes.map(x=>x.Name)
        var keys=Object.keys(event.Attributes).filter(x=>attributes.includes(x))
        var AttributeUpdates=keys.map(key=>{
            return {
                ObjectAttributeAction:{
                    ObjectAttributeActionType:"CREATE_OR_UPDATE",
                    ObjectAttributeUpdateValue:{
                        StringValue:event.Attributes[key]
                    }
                },
                ObjectAttributeKey:{
                    FacetName:event.Type,
                    Name:key,
                    SchemaArn:process.env.SCHEMA
                }
            }
        })
        console.log(JSON.stringify(AttributeUpdates,null,2))

        return cd.updateObjectAttributes({
            DirectoryArn:process.env.DIRECTORY,
            ObjectReference:{
                Selector:`\$${event.ID}`
            },
            AttributeUpdates
        }).promise()
    })
    .then(result=>{
        console.log(result)
        callback(null,{
            ObjectIdentifier:event.ID 
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
