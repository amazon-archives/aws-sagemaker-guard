var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var send=require('request').send
var _=require('lodash')
var cd=new aws.CloudDirectory()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.params.querystring
    var id=params.ID
    var type=params.Type
    
    Promise.all([
        cd.listObjectAttributes({
            DirectoryArn:process.env.DIRECTORY,
            ObjectReference:{
                Selector:`\$${id}`
            }
        }).promise(),
        send({
            href:`${process.env.API}/templates/instances`,
            method:"GET"
        })
    ])
    .then(results=>{
        console.log(JSON.stringify(results,null,2))
        var objectAttributes=results[0].Attributes
        var schema=results[1].collection.template.data.schema
        delete schema.required
        schema.properties=_.omit(
            _.pickBy(schema.properties,(value,key)=>!value.immutable),
            ["InstanceType"])

        objectAttributes.forEach(x=>{
            if(schema.properties[x.Key.name]){
                schema.properties[x.Key.name].default=x.Value.StringValue
            }
        })
        
        console.log(JSON.stringify(schema,null,2))
        callback(null,schema)
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

function filterRoles(result){
    var doc=JSON.parse(
        decodeURIComponent(result.AssumeRolePolicyDocument)
        )
    return doc.Statement
        .filter(x=>x.Principal.Service==="sagemaker.amazonaws.com")
        .length
}
