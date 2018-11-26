var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()
var ec2=new aws.EC2()
var kms=new aws.KMS()
var iam=new aws.IAM()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.params.querystring
    var id=params.ID
    var type=params.Type

    var roles=new Promise(function(res,rej){
        var out=[]

        function next(token){
            iam.listRoles({
                Marker:token
            }).promise()
            .then(result=>{
                console.log(result)
                result.Roles
                    .filter(filterRoles)
                    .map(x=>{return{
                        RoleName:x.RoleName,
                        Arn:x.Arn
                    }})
                    .forEach(x=>out.push(x))
                if(result.IsTruncated){
                    next(result.Marker)
                }else{
                    res(out)
                }
            })
            .catch(rej)
        }
        next()
    })
    
    Promise.all([cd.listFacetAttributes({
        Name:type,
        SchemaArn:process.env.SCHEMA
    }).promise(),
    cd.listObjectAttributes({
        DirectoryArn:process.env.DIRECTORY,
        ObjectReference:{
            Selector:`\$${id}`
        }
    }).promise(),
    roles
    ])
    .then(results=>{
        console.log(JSON.stringify(results,null,2))
        var facetAttributes=results[0].Attributes
        var objectAttributes=results[1].Attributes
        var roles=results[2]

        mutable=facetAttributes
            .filter(x=>!x.AttributeDefinition.IsImmutable)
            .map(x=>{
                tmp=objectAttributes.find(y=>y.Key.Name===x.Name)
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
        console.log(JSON.stringify(mutable,null,2))
        role=mutable.find(x=>x.name==="RoleArn").value
        mutable=mutable.filter(x=>x.name!=="RoleArn") 
        console.log(JSON.stringify(mutable,null,2))
        callback(null,{params,mutable,roles,role})
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
