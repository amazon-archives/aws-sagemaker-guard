var fs=require('fs')
var _=require('lodash')
module.exports=_.mapKeys({
    "Domain":{
        "Type": "Custom::CognitoDomain",
        "DependsOn":["UserPool"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNCognitoDomainLambda", "Arn"] },
            "Name":{"Ref":"AWS::StackName"},
            "UserPool":{"Ref":"UserPool"}
        }
    },
    "userLogin":{
        "Type": "Custom::CognitoLogin",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNCognitoLoginLambda", "Arn"] },
            "UserPool":{"Ref":"UserPool"},
            "ClientId":{"Ref":"UserClient"},
            "LoginCallbackUrls":[{"Fn::GetAtt":["UserLoginRoute","href"]}],
            "OAuthFlows":["implicit"]
        }
    },
    "AdminLogin":{
        "Type": "Custom::CognitoLogin",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNCognitoLoginLambda", "Arn"] },
            "UserPool":{"Ref":"UserPool"},
            "ClientId":{"Ref":"AdminClient"},
            "LoginCallbackUrls":[{"Fn::GetAtt":["AdminLoginRoute","href"]}],
            "OAuthFlows":["code","implicit"]
        }
    }
},(val,key)=>`Cognito${key}`)
