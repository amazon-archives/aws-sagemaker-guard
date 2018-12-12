var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var cognito=new aws.CognitoIdentityServiceProvider()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    
    if(event.RequestType!=="Delete"){
        
        cognito.adminSetUserMFAPreference({
            UserPoolId:params.UserPoolId,
            Username:params.Username,
            SMSMfaSettings:{
                Enabled:true,
                PreferredMfa:true
            }
        }).promise()    
        .then(x=>response.send(event, context, response.SUCCESS))
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
    }else{
        response.send(event, context, response.SUCCESS)
    }
}

