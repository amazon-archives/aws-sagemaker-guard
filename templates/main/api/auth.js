module.exports={
    CognitoAuthorizer:{
        "Type" : "AWS::ApiGateway::Authorizer",
        "Properties" : {
            "IdentitySource":"method.request.header.authorization",
            "Name":"CognitoAuthorizer",
            "ProviderARNs":[{"Fn::GetAtt":["UserPool","Arn"]}],
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
    }
}
