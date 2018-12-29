var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var send=require('request').send
var _=require('lodash')
var cd=new aws.CloudDirectory()
var cf=new aws.CloudFormation()

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
        var attributes=_.fromPairs(results[0].Attributes.map(x=>[x.Key.name,x.Value.StringValue]))

        cf.describeStacks({
            StackName:attributes.StackName
        }).promise()
        .then(cf_results=>{
            var status=cf_results.Stacks[0].StackStatus
            var state=_.fromPairs(cf_results.Stacks[0]
                .Outputs.map(x=>[x.OutputKey,x.OutputValue])).State

            var updateable=["DisplayName","Description","IdleShutdown","OnTerminateDocument","OnStopDocument"]
            if(status.match(/.*_COMPLETE/) && state==="OFF"){
                updateable=updateable.concat([
                    "OnStartDocument","GlueDevEndpoint","RoleArn","InstanceType","AcceleratorTypes","AdditionalCodeRepositories","DefaultCodeRepository"
                ])
            }
            var schema=results[1].collection.template.data.schema
            schema.required=_.intersection(schema.required,updateable)
            
            schema.properties=_.pick(
                _.pickBy(schema.properties,(value,key)=>!value.immutable),
                updateable
            )
            _.each(attributes,(key,value)=>{
                if(schema.properties[key]){
                    schema.properties[key].default=value
                }
            })
            console.log(JSON.stringify(schema,null,2))
            callback(null,schema)
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

function filterRoles(result){
    var doc=JSON.parse(
        decodeURIComponent(result.AssumeRolePolicyDocument)
        )
    return doc.Statement
        .filter(x=>x.Principal.Service==="sagemaker.amazonaws.com")
        .length
}
