var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()
var cf=new aws.CloudFormation()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    return Promise.all([
        lambda.invoke({
            FunctionName:event.FunctionName,
            InvocationType:"RequestResponse",
            Payload:JSON.stringify(event)
        }).promise(),
        lambda.invoke({
            FunctionName:process.env.ESPROXY,
            InvocationType:"RequestResponse",
            Payload:JSON.stringify({
                 "endpoint":process.env.ESADDRESS,
                 "path":"/logins-*/_search",
                 "method":"GET",
                 "body":{
                     "query":{
                         "match":{
                             "requestContext.authorizer.InstanceName":event.ID
                         }
                     },
                     "sort":[{
                        "requestContext.requestTimeEpoch":{
                            "order":"desc"
                        }
                     }]
                 }  
            })
        }).promise()
    ]).then(results=>results.map(result=>{
        console.log(JSON.stringify(result,null,2))
        if(result.FunctionError){
            throw JSON.parse(JSON.parse(result.Payload).errorMessage)
        }else{
            return JSON.parse(result.Payload)
        }
    }))
    .then(results=>{
        var result=results[0]
        var es=results[1]
        if(es.hits.total>0){
            var logins=es.hits.hits
                .map(x=>`${x._source.requestContext.authorizer.principalId} ${x._source.requestContext.requestTime}`) 
        }else{
            var logins=null
        }
        return cf.describeStacks({
            StackName:result.attributes.StackName
        }).promise()
        .then(stack=>{
            var outputs={}
            stack.Stacks[0].Outputs.forEach(out=>{
                outputs[out.OutputKey]=out.OutputValue
            })
            if(outputs.NoteBookName){
                var NotebookInstanceName=outputs.NoteBookName
                return sagemaker.describeNotebookInstance({
                    NotebookInstanceName
                }).promise()
                .then(function(info){
                    Object.assign(result.attributes,outputs,info)
                    delete result.attributes.policy_type
                    delete result.attributes.policy_document
                    if(logins) result.attributes["Last Logins"]=logins 
                    callback(null,Object.assign(
                        {attributes:result.attributes},
                        event
                    ))
                })
            }else{
                result.attributes.status="creating"
                delete result.attributes.policy_type
                delete result.attributes.policy_document

                if(logins) result.attributes["Last Logins"]=logins 
                callback(null,Object.assign(
                    {attributes:result.attributes},
                    event
                ))
            }
        })
        .catch(error=>{
            if(error.code==="ValidationError"){
                callback(null,Object.assign(
                    {attributes:Object.assign(
                        result.attributes,
                        {status:"StackFailed"}
                    )},
                    event
                ))
            }else{
                throw error
            }
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
