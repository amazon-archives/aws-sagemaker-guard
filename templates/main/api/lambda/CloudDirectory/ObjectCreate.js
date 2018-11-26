var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var crypto=require('crypto')
var cd=new aws.CloudDirectory()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
     
    Promise.all([cd.listFacetAttributes({
        Name:event.Type,
        SchemaArn:process.env.SCHEMA
    }).promise(),
    cd.getFacet({
        Name:event.Type,
        SchemaArn:process.env.SCHEMA
    }).promise()
    ])
    .then(function(result){
        console.log(result)
        var attributes=result[0].Attributes.map(x=>x.Name)
        var type=result[1].Facet.ObjectType
        var keys=Object.keys(event.Attributes).filter(x=>attributes.includes(x))
        var ObjectAttributeList=keys.map(key=>{
            return {
                Key:{
                    FacetName:event.Type,
                    Name:key,
                    SchemaArn:process.env.SCHEMA
                },
                Value:key!=="policy_document" ? {
                    StringValue:event.Attributes[key]
                } :{
                    BinaryValue:new Buffer(event.Attributes[key])
                }
            }
        })
        if(type==="POLICY"){
            ObjectAttributeList.push({
                Key:{
                    FacetName:event.Type,
                    Name:"policy_document",
                    SchemaArn:process.env.SCHEMA
                },
                Value:{
                    BinaryValue:new Buffer(event.Attributes["policy_document"])
                }
            })
            ObjectAttributeList.push({
                Key:{
                    FacetName:event.Type,
                    Name:"policy_type",
                    SchemaArn:process.env.SCHEMA
                },
                Value:{
                    StringValue:event.Attributes["policy_type"]
                }
            })
        }
        console.log(JSON.stringify(ObjectAttributeList,null,2))
        return cd.batchWrite({
            DirectoryArn:process.env.DIRECTORY,
            Operations:[{
                CreateObject:{
                    BatchReferenceName:"ref",
                    ObjectAttributeList,
                    LinkName:event.Attributes.ID,
                    ParentReference:{
                        Selector:`/${event.Type}`
                    },
                    SchemaFacet:[{
                        FacetName:event.Type,
                        SchemaArn:process.env.SCHEMA
                    }]
                }
            },{
                AttachToIndex:{
                    IndexReference:{
                        Selector:`/index/${event.Type}`
                    },
                    TargetReference:{
                        Selector:"#ref"
                    }
                }
            }]
        }).promise()
    })
    .then(result=>{
        console.log(result)
        callback(null,result)
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
