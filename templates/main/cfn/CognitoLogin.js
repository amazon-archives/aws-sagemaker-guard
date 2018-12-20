var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var cognito=new aws.CognitoIdentityServiceProvider()
var crypto=require('crypto')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    if(event.RequestType!=="Delete"){
        var url=params.CallbackUrl
        
        return cognito.updateUserPoolClient({
            ClientId:params.ClientId,
            UserPoolId:params.UserPool,
            CallbackURLs:params.LoginCallbackUrls,
            LogoutURLs:[],
            RefreshTokenValidity:1,
            SupportedIdentityProviders:['COGNITO'],
            AllowedOAuthFlows:params.OAuthFlows,
            AllowedOAuthScopes:['phone', 'email', 'openid', 'profile'],
            AllowedOAuthFlowsUserPoolClient:true
        }).promise()
        .then(()=>response.send(event, context, response.SUCCESS,{url}))
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
    }else{
        response.send(event, context, response.SUCCESS)
    }
}




