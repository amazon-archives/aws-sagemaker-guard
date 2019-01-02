var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()
var cf=new aws.CloudFormation()
var _=require('lodash')

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
                 "path":"/logins/_search",
                 "method":"GET",
                 "body":{
                     "size":4,
                     "query":{
                         "term":{
                             "InstanceName":event.ID
                         }
                     },
                     "sort":[{
                        "Date":{
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
        result.attributes=_.omit(result.attributes,["policy_type","policy_document"])
        var es=results[1]
        if(es.hits.total>0){
            var logins=es.hits.hits
                .map(x=>`${x._source.UserName} ${Date(x._source.Date)}`) 
        }else{
            var logins=null
        }
        return cf.describeStacks({
            StackName:result.attributes.StackName
        }).promise()
        .then(stack=>{
            console.log(_.omitBy(
                _.fromPairs(stack.Stacks[0].Outputs.map(x=>[x.OutputKey,x.OutputValue])),
                (value,key)=>value==="EMPTY"))
            var outputs=_.omit(_.omitBy(
                _.fromPairs(stack.Stacks[0].Outputs.map(x=>[x.OutputKey,x.OutputValue])),
                (value,key)=>value==="EMPTY"),
                ["JupyterProxyCFNLambda","LambdaUtilLayer","NotebookInstanceLifecycleConfigName"])

            var status=stack.Stacks[0].StackStatus
            if(outputs.NoteBookName){
                var NotebookInstanceName=outputs.NoteBookName
                result.attributes.status= status.match(/UPDATE_/) ? "updating" : "ready"
                return sagemaker.describeNotebookInstance({
                    NotebookInstanceName
                }).promise()
                .then(function(info){
                    Object.assign(result.attributes,outputs,info)
                    if(logins) result.attributes["Last Logins"]=logins 
                    callback(null,Object.assign(
                        {attributes:result.attributes},
                        event
                    ))
                })
            }else{
                result.attributes.status=status==="CREATE_IN_PROGRESS" ? "creating" : "failed"

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
                        {status:"failed"}
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
