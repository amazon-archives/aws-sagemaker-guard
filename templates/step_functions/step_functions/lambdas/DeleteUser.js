var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cognito=new aws.CognitoIdentityServiceProvider()
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    return cognito.adminDeleteUser({
        UserPoolId:event.UserPool,
        Username:data.object.ID
    }).promise()
    .then(()=>callback(null,event))
}
