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
"URLs":{
    "Type": "Custom::Variable",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNVariableLambda", "Arn"] },
        "API":{"Fn::Sub":"https://${API}.execute-api.${AWS::Region}.amazonaws.com/${Constants.ApiStageName}"},
        "UserAPI":{"Fn::Sub":"https://${API}.execute-api.${AWS::Region}.amazonaws.com/${Constants.ApiStageName}/website/api"},
        "AdminLogin":{"Fn::Sub":"https://${API}.execute-api.${AWS::Region}.amazonaws.com/${Constants.ApiStageName}/website/admin"},
        "AdminPage":{"Fn::Sub":"https://${API}.execute-api.${AWS::Region}.amazonaws.com/${Constants.ApiStageName}/website?view=admin"},
        "UserPage":{"Fn::Sub":"https://${API}.execute-api.${AWS::Region}.amazonaws.com/${Constants.ApiStageName}/website?view=user"},
        "UserLogin":{"Fn::Sub":"https://${API}.execute-api.${AWS::Region}.amazonaws.com/${Constants.ApiStageName}/website/user"},
        "CognitoEndpoint":{"Fn::Sub":"${QNA.Outputs.CognitoEndpoint}"}
    }
},
"AdminLoginRouteEncoded":{
    "Type": "Custom::URIEncodedString",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNEncodeURIComponentLambda", "Arn"] },
        "value":{"Fn::GetAtt":["URLs","AdminPage"]}
    }
},
"UserLoginRouteEncoded":{
    "Type": "Custom::URIEncodedString",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNEncodeURIComponentLambda", "Arn"] },
        "value":{"Fn::GetAtt":["URLs","UserPage"]}
    }
},
"AdminLogin":{
    "Type": "Custom::Variable",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNVariableLambda", "Arn"] },
        "href":{"Fn::Sub":"${URLs.CognitoEndpoint}/login?redirect_uri=${AdminLoginRouteEncoded.value}&response_type=code&client_id=${AdminClient}"}
    }
},
"UserLogin":{
    "Type": "Custom::Variable",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNVariableLambda", "Arn"] },
        "href":{"Fn::Sub":"${URLs.CognitoEndpoint}/login?redirect_uri=${UserLoginRouteEncoded.value}&response_type=code&client_id=${UserClient}"}
    }
}
}
