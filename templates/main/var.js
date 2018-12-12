module.exports={
"Constants":{
    "Type": "Custom::Variable",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNVariableLambda", "Arn"] },
        "ApiStageName":"v1",
        "BuildDate":new Date(),
        "Version":require('../../package').version
    }
},
"ApiUrl":{
    "Type": "Custom::Variable",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNVariableLambda", "Arn"] },
        "href":{"Fn::Sub":"https://${API}.execute-api.${AWS::Region}.amazonaws.com/${Constants.ApiStageName}"}
    }
},
"AdminLoginUrl":{
    "Type": "Custom::Variable",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNVariableLambda", "Arn"] },
        "href":{"Fn::Sub":"${ApiUrl.href}/login/admin"}
    }
},
"UserLoginUrl":{
    "Type": "Custom::Variable",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNVariableLambda", "Arn"] },
        "href":{"Fn::Sub":"${ApiUrl.href}/login/user"}
    }
},
"CognitoEndpoint":{
    "Type": "Custom::Variable",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNVariableLambda", "Arn"] },
        "href":{"Fn::Sub":"${QNA.Outputs.CognitoEndpoint}"}
    }
},
"AdminLoginRoute":{
    "Type": "Custom::Variable",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNVariableLambda", "Arn"] },
        "href":{"Fn::Sub":"${ApiUrl.href}/website/admin"}
    }
},
"UserLoginRoute":{
    "Type": "Custom::Variable",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNVariableLambda", "Arn"] },
        "href":{"Fn::Sub":"${ApiUrl.href}/website/user"}
    }
},
"AdminLoginRouteEncoded":{
    "Type": "Custom::URIEncodedString",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNEncodeURIComponentLambda", "Arn"] },
        "value":{"Fn::GetAtt":["AdminLoginRoute","href"]}
    }
},
"UserLoginRouteEncoded":{
    "Type": "Custom::URIEncodedString",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNEncodeURIComponentLambda", "Arn"] },
        "value":{"Fn::GetAtt":["UserLoginRoute","href"]}
    }
},
"AdminLogin":{
    "Type": "Custom::Variable",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNVariableLambda", "Arn"] },
        "href":{"Fn::Sub":"${CognitoEndpoint.href}/login?redirect_uri=${AdminLoginRouteEncoded.value}&response_type=code&client_id=${AdminClient}"}
    }
},
"UserLogin":{
    "Type": "Custom::Variable",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNVariableLambda", "Arn"] },
        "href":{"Fn::Sub":"${CognitoEndpoint.href}/login?redirect_uri=${UserLoginRouteEncoded.value}&response_type=token&client_id=${UserClient}"}
    }
}
}
