var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    lambda.invoke({
        FunctionName:process.env.OBJECT_CREATE_LAMBDA,
        InvocationType:"Event",
        Payload:JSON.stringify({
            Type:"users",
            Attributes:Object.assign({ID:event.userName},event.request.userAttributes)
        })
    }).promise()
    .then(result=>{
        if(result.FunctionError){
            callback(JSON.parse(JSON.parse(result.Payload).errorMessage))
        }else{
            callback(null,event)
        }
    })
    .catch(callback)
};

