module.exports={
    CognitoAuthorizer:{
        "Type" : "AWS::ApiGateway::Authorizer",
        "Properties" : {
            "IdentitySource":"method.request.header.authorization",
            "Name":"CognitoAuthorizer",
            "ProviderARNs":[{"Fn::Sub":"arn:aws:cognito-idp:${AWS::Region}:${AWS::AccountId}:userpool/${QNA.Outputs.UserPool}"}],
            "RestApiId":{"Ref":"API"},
            "Type":"COGNITO_USER_POOLS"
        }
    },
    ClouddirectoryAuthorizer:{
        "Type" : "AWS::ApiGateway::Authorizer",
        "Properties" : {
            "AuthorizerCredentials":{"Fn::GetAtt":["ApiGatewayRole","Arn"]},
            "AuthorizerUri":{"Fn::Sub":"arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${APIAuthLambda.Arn}/invocations"},
            "IdentitySource":"method.request.header.authorization",
            "Name":"ClouddirectoryAuthorizer",
            "AuthorizerResultTtlInSeconds":0,
            "RestApiId":{"Ref":"API"},
            "Type":"REQUEST"
        }
    },
    ClouddirectoryHeaderAuthorizer:{
        "Type" : "AWS::ApiGateway::Authorizer",
        "Properties" : {
            "AuthorizerCredentials":{"Fn::GetAtt":["ApiGatewayRole","Arn"]},
            "AuthorizerUri":{"Fn::Sub":"arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${APIAuthLambda.Arn}/invocations"},
            "IdentitySource":"method.request.querystring.Auth",
            "Name":"ClouddirectoryHeaderAuthorizer",
            "AuthorizerResultTtlInSeconds":0,
            "RestApiId":{"Ref":"API"},
            "Type":"REQUEST"
        }
    }
}
