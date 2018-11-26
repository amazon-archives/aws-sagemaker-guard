var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.params.querystring
    var id=params.ID
    var type=params.Type

    Promise.all([cd.listFacetAttributes({
        Name:type,
        SchemaArn:process.env.SCHEMA
    }).promise(),
    cd.listObjectAttributes({
        DirectoryArn:process.env.DIRECTORY,
        ObjectReference:{
            Selector:`\$${id}`
        }
    }).promise()
    ])
    .then(results=>{
        console.log(JSON.stringify(results,null,2))
        var facetAttributes=results[0].Attributes
        var objectAttributes=results[1].Attributes

        mutable=facetAttributes.filter(x=>!x.AttributeDefinition.IsImmutable)
            .map(x=>{
                tmp=objectAttributes.find(y=>y.Key.Name===x.Name)
                console.log(x,tmp)
                if(tmp){
                    return {
                        name:x.Name,
                        value:tmp.Value.StringValue
                    }
                }else{
                    return {
                        name:x.Name,
                        value:""
                    }
                }
            })
        return mutable 
        
    })
    .then(result=>{
        console.log(JSON.stringify(result,null,2))
        callback(null,{params,result})
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
