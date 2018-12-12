var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cognito=new aws.CognitoIdentityServiceProvider()
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    Promise.all([cognito.describeUserPool({
        UserPoolId:event.UserPool
    }).promise(),
    lambda.invoke({
        FunctionName:event.GetFunctionName,
        InvocationType:"RequestResponse",
        Payload:JSON.stringify(event)
    }).promise().then(result=>{
        console.log(JSON.stringify(result,null,2))
        if(result.FunctionError){
            throw JSON.parse(JSON.parse(result.Payload).errorMessage)
        }else{
            return JSON.parse(result.Payload)
        }
    })])
    .then(function(result){
        console.log(JSON.stringify(result,null,2))
        var pool=result[0]
        var obj=result[1]

        var allowed=pool.UserPool.SchemaAttributes
            .filter(x=>x.Mutable)
            .map(x=>x.Name)

        var Attributes=Object.keys(event.Attributes)
            .filter(key=>allowed.includes(key))
            .map(key=>{
                return {Name:key,Value:event.Attributes[key]}
            })

        if(event.Attributes.email || event.Attributes.phone_number){
            return cognito.adminUpdateUserAttributes({
                UserPoolId:event.UserPool,
                Username:obj.attributes.ID,
                UserAttributes:Attributes
            }).promise()
        }
    })
    .then(response=>lambda.invoke({
        FunctionName:event.FunctionName,
        InvocationType:"RequestResponse",
        Payload:JSON.stringify(event)
    }).promise())
    .then(result=>{
        console.log(JSON.stringify(result,null,2))
        if(result.FunctionError){
            throw JSON.parse(JSON.parse(result.Payload).errorMessage)
        }else{
            callback(null,event)
        }
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
