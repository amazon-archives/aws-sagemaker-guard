var resource=require('../util/resource')

module.exports={
    "ApiEndpoint":resource('api'),
    "ApiEndpointMethod":proxy({"Ref":"ApiEndpoint"}),
    "ProxyLambda":resource('{proxy+}',{"Ref":"ApiEndpoint"}),
    "ProxyLambdaMethod":proxy({"Ref":"ProxyLambda"}) 
}


function proxy(resource){
    return {
        "Type": "AWS::ApiGateway::Method",
        "Properties": {
            "AuthorizationType":"AWS_IAM",
            "HttpMethod": "ANY",
            "Integration": {
              "Type": "AWS_PROXY",
              "Credentials":{"Fn::GetAtt":["ApiGatewayRole","Arn"]},
              "IntegrationHttpMethod": "POST",
              "Uri": {"Fn::Join": ["",[
                    "arn:aws:apigateway:",
                    {"Ref": "AWS::Region"},
                    ":lambda:path/2015-03-31/functions/",
                    {"Fn::GetAtt":["Lambda","Arn"]},
                    "/invocations"
              ]]}
            },
            "RequestModels":{
                "application/json":{"Ref":"Model"}
            },
            "ResourceId":resource,
            "MethodResponses": [{
                "StatusCode": 200
            }],
            "RestApiId": {"Ref": "API"}
        }
    }
}
