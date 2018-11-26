var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()
var kms=new aws.KMS()
var iam=new aws.IAM()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.params.querystring

    isInstance=params.SourceType==="instances"
    fnc=process.env[isInstance ? "POLICYLISTLAMBDA" : "ATTACHMENTLISTLAMBDA" ]

    already=lambda.invoke({
        FunctionName:fnc,
        InvocationType:"RequestResponse",
        Payload:JSON.stringify({
            ID:params.SourceID,
            SourceType:params.SourceType,
            TargetType:params.DestType,
            MaxResults:10,
            NextToken:null,
            ChildrenOrParents:params.Relationship
        })
    }).promise()
    .then(x=>{
        console.log("already",x)
        results=JSON.parse(x.Payload)
        if(results.Links){
            if(params.Relationship==="children"){
                return results.Links.map(y=>y.TargetObjectReference.Selector.slice(1))
            }else{
                return results.Links.map(y=>y.SourceObjectReference.Selector.slice(1))
            }
        }else{
            return []
        }
    })
    
    possible=lambda.invoke({
        FunctionName:process.env.INDEXLISTLAMBDA,
        InvocationType:"RequestResponse",
        Payload:JSON.stringify({
            Type:params.DestType,
            MaxResults:10,
        })
    }).promise()
    .then(x=>{
        console.log("possible",x)
        results=JSON.parse(x.Payload).IndexAttachments
        return results.map(y=>y.ObjectIdentifier)
    })

    Promise.all([
        possible,
        already,
    ])
    .then(x=>{
        console.log(x)
        return x
    })
    .then(x=>x[0].filter(y=>!x[1].includes(y)))
    .then(IDs=>{
        return Promise.all(IDs.map(id=>{
            return lambda.invoke({
                FunctionName:process.env.OBJECTGETLAMBDA,
                InvocationType:"RequestResponse",
                Payload:JSON.stringify({
                    ID:id,
                })
            }).promise()
            .then(x=>JSON.parse(x.Payload))
        }))
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

function filterRoles(result){
    var doc=JSON.parse(
        decodeURIComponent(result.AssumeRolePolicyDocument)
        )
    console.log(doc.Statement)        
    return doc.Statement
        .filter(x=>x.Principal.Service==="sagemaker.amazonaws.com")
        .length
}
