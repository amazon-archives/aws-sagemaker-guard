var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var ec2=new aws.EC2()
var kms=new aws.KMS()
var iam=new aws.IAM()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

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
    var keys=new Promise(function(res,rej){
        var out=[]

        function next(token){
            kms.listKeys({
                Marker:token,
                Limit:1000,
            }).promise()
            .then(result=>{
                console.log(result)
                result.Keys
                    .forEach(x=>out.push(x))

                if(result.Truncated){
                    next(result.NextMarker)
                }else{
                    res(out)
                }
            })
            .catch(rej)
        }
        next()
    })
   
    
    Promise.all([
        keys,
        roles,
    ])
    .then(result=>callback(null,{
        keys:result[0],
        roles:result[1]
    }))
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
    console.log(doc.Statement)        
    return doc.Statement
        .filter(x=>x.Principal.Service==="sagemaker.amazonaws.com")
        .length
}
