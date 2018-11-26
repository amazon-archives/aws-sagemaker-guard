var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cognito=new aws.CognitoIdentityServiceProvider()
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    return cognito.adminCreateUser({
        UserPoolId:event.UserPool,
        Username:event.Attributes.ID,
        DesiredDeliveryMediums:["EMAIL"],
        UserAttributes:[{
            Name:"email",
            Value:event.Attributes.email
        }]
    }).promise()
    .then(()=>callback(null,event)) 
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
