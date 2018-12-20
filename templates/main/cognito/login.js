var fs=require('fs')
var _=require('lodash')
module.exports=_.mapKeys({
    "userLogin":{
        "Type": "Custom::CognitoLogin",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNCognitoLoginLambda", "Arn"] },
            "UserPool":{"Fn::GetAtt":["QNA","Outputs.UserPool"]},
            "ClientId":{"Ref":"UserClient"},
            "LoginCallbackUrls":[{"Fn::GetAtt":["URLs","UserPage"]}],
            "OAuthFlows":["code","implicit"]
        }
    },
    "AdminLogin":{
        "Type": "Custom::CognitoLogin",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNCognitoLoginLambda", "Arn"] },
            "UserPool":{"Fn::GetAtt":["QNA","Outputs.UserPool"]},
            "ClientId":{"Ref":"AdminClient"},
            "LoginCallbackUrls":[{"Fn::GetAtt":["URLs","AdminPage"]}],
            "OAuthFlows":["code","implicit"]
        }
    }
},(val,key)=>`Cognito${key}`)
