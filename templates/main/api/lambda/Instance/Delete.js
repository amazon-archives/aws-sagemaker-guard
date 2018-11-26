var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    lambda.invoke({
        FunctionName:event.GetFunctionName,
        InvocationType:"RequestResponse",
        Payload:JSON.stringify(event)
    }).promise()
    .then(result=>{
        console.log(JSON.stringify(result,null,2))
        if(result.FunctionError){
            throw JSON.parse(JSON.parse(result.Payload).errorMessage)
        }else{
            var payload=JSON.parse(result.Payload)
            payload.deleteParams=event
            return lambda.invoke({
                FunctionName:event.DeleteInstanceFunctionName,
                InvocationType:"Event",
                Payload:JSON.stringify(payload)
            }).promise()
            .then(x=>payload)
        }
    })
    .then(result=>new Promise(function(res,rej){
        next(100)
        function next(count){
            console.log(`try ${100-count}`)
            sagemaker.describeNotebookInstance({
                NotebookInstanceName:`SageGuard-${result.attributes.ID}`
            }).promise()
            .then(response=>{
                 if(response.NotebookInstanceStatus==="InService"){
                    if(count){
                        setTimeout(()=>next(--count),100)
                    }else{
                        rej("timeout waiting for instance to begin stopping")
                    }
                 }else if(response.NotebookInstanceStatus==="Stopping"){
                    res() 
                 }else if(response.NotebookInstanceStatus==="Stopped"){
                    res()
                }else{
                    rej(response)
                }
            })
            .catch(rej)
        }
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
