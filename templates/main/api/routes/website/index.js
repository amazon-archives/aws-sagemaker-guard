var _=require('lodash')
var fs=require('fs')
var util=require('../util')

module.exports={
    "WebsiteResource":util.resource('website'),
    "AdminWebsiteResource":util.resource('admin',{"Ref":"WebsiteResource"}),
    "UserWebsiteResource":util.resource('user',{"Ref":"WebsiteResource"}),
    "AdminWebsiteResourceGet":{
      "Type": "AWS::ApiGateway::Method",
      "Properties": {
        "AuthorizationType":"NONE",
        "HttpMethod":"GET",
        "Integration": {
          "Type": "MOCK",
          "IntegrationResponses": [{
            "ResponseTemplates":{
                "text/html": {"Fn::Sub":fs.readFileSync(`${__dirname}/admin.vm`,"utf8")}
            },
            "ResponseParameters":{
                "method.response.header.Content-Type":"'text/html'"
            },
            "StatusCode":200
          }],
          "RequestTemplates": {
            "application/json":"{\"statusCode\": 200}"
          }
        },
        "ResourceId":{"Ref":"AdminWebsiteResource"},
        "MethodResponses": [{
            "StatusCode": 200,
            "ResponseParameters":{
                "method.response.header.Content-Type":true
            }
        }],
        "RestApiId":{"Ref":"API"} 
      }
    },
    "UserWebsiteResourceGet":{
      "Type": "AWS::ApiGateway::Method",
      "Properties": {
        "AuthorizationType":"NONE",
        "HttpMethod":"GET",
        "Integration": {
          "Type": "MOCK",
          "IntegrationResponses": [{
            "ResponseTemplates":{
                "text/html": {"Fn::Sub":fs.readFileSync(`${__dirname}/user.vm`,"utf8")}
            },
            "ResponseParameters":{
                "method.response.header.Content-Type":"'text/html'"
            },
            "StatusCode":200
          }],
          "RequestTemplates": {
            "application/json":"{\"statusCode\": 200}"
          }
        },
        "ResourceId":{"Ref":"UserWebsiteResource"},
        "MethodResponses": [{
            "StatusCode": 200,
            "ResponseParameters":{
                "method.response.header.Content-Type":true
            }
        }],
        "RestApiId":{"Ref":"API"} 
      }
    },
    "WebsiteAssets":util.resource('assets',{"Ref":"WebsiteResource"}),
    "WebsiteAsset":util.resource('{proxy+}',{"Ref":"WebsiteAssets"}),
    "WebsiteAssetsAnyGet":util.proxy({
        resource:{"Ref":"WebsiteAsset"},
        auth:"NONE",
        method:"get",
        path:"/{proxy}",
        requestParams:{
            "integration.request.path.proxy":"method.request.path.proxy"
        }
    }),
    "WebsiteAssetsAnyHead":util.proxy({
        resource:{"Ref":"WebsiteAsset"},
        auth:"NONE",
        method:"head",
        path:"/{proxy}",
        requestParams:{
            "integration.request.path.proxy":"method.request.path.proxy"
        }
    }),
}


