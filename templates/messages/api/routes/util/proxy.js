var _=require('lodash')

module.exports=function proxy(opts){
    return {
      "Type": "AWS::ApiGateway::Method",
      "Properties": {
        "AuthorizationType": "NONE",
        "HttpMethod":opts.method.toUpperCase(),
        "Integration": {
          "Type": "AWS",
          "IntegrationHttpMethod":opts.method.toUpperCase(),
          "Credentials":{"Fn::GetAtt":["ApiGatewayRole","Arn"]},
          "Uri": {"Fn::Join": ["",[
                "arn:aws:apigateway:",
                {"Ref": "AWS::Region"},
                ":s3:path/",{"Ref":"WebsiteBucket"},
                opts.path
          ]]},
          "RequestParameters":opts.requestParams || {},
          "IntegrationResponses": [
            {
                "StatusCode":200,
                "ResponseParameters":Object.assign({
                    "method.response.header.content-type":"integration.response.header.Content-Type"
                },
                opts.responseParameters)
            },{
                "StatusCode":404,
                "ResponseTemplates":{
                    "application/xml":JSON.stringify({
                        error:"Not found"
                    })
                },
                "SelectionPattern":"403"
            }
          ]
        },
        "RequestParameters":{
            "method.request.path.proxy":false
        },
        "ResourceId":opts.resource,
        "MethodResponses": [
          {
            "StatusCode": 200,
            "ResponseParameters":Object.assign({
                "method.response.header.content-type":false
            },
            _.mapValues(opts.responseParameters || {},x=>false))
          },
          {"StatusCode": 400},
          {"StatusCode": 404}
        ],
        "RestApiId": {"Ref": "API"}
      }
    }
}
