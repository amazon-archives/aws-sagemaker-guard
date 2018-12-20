module.exports=function(url,resource){
    return {
      "Type": "AWS::ApiGateway::Method",
      "Properties": {
        "AuthorizationType": "NONE",
        "HttpMethod": "GET",
        "Integration": {
          "Type": "MOCK",
          "Credentials":{"Fn::GetAtt":["ApiGatewayRole","Arn"]},
          "IntegrationResponses": [{
            "ResponseParameters":{
                "method.response.header.location":{"Fn::Join":["",[
                    "'",url,"'"
                ]]}
            },
            "StatusCode":"302",
          }],
          "RequestTemplates": {
            "application/json":"{\"statusCode\": 302}"
          }
        },
        "ResourceId":resource,
        "MethodResponses": [{
            "StatusCode": 302,
            "ResponseParameters":{
                "method.response.header.location":true
            }
        }],
        "RestApiId": {"Ref": "API"}
      }
    }
}
    
