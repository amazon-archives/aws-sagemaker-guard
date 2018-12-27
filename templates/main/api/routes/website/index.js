var _=require('lodash')
var fs=require('fs')
var util=require('../util')

module.exports={
    "WebsiteResource":util.resource('website'),
    "WebsiteResourceGet":{
      "Type": "AWS::ApiGateway::Method",
      "Properties": {
        "AuthorizationType":"NONE",
        "HttpMethod":"GET",
        RequestParameters:{
            "method.request.querystring.view":"view"
        },
        "Integration": {
          "Type": "MOCK",
          "IntegrationResponses": [{
            "ResponseTemplates":{
                "text/html": {"Fn::Sub":fs.readFileSync(`${__dirname}/app.vm`,"utf8")}
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
        "ResourceId":{"Ref":"WebsiteResource"},
        "MethodResponses": [{
            "StatusCode": 200,
            "ResponseParameters":{
                "method.response.header.Content-Type":true
            }
        }],
        "RestApiId":{"Ref":"API"} 
      }
    },
    "WebsiteAPIResource":util.resource('api',{"Ref":"WebsiteResource"}),
    "WebsiteAPIResourceGet":util.mock({
        method:"Get",
        auth:"NONE",
        resource:{"Ref":"WebsiteAPIResource"},
        template:`${__dirname}/info.vm`
    }),
    "AdminWebsiteResource":util.resource('admin',{"Ref":"WebsiteResource"}),
    "AdminWebsiteResource":util.resource('admin',{"Ref":"WebsiteResource"}),
    "AdminWebsiteResourceGet":util.redirect(
        {"Fn::GetAtt":["LoginURLS","AdminLogin"]},
        {"Ref":"AdminWebsiteResource"}
    ),
    "AdminWebsiteLogoutResource":util.resource('logout',{"Ref":"AdminWebsiteResource"}),
    "AdminWebsiteLogoutResourceGet":util.redirect(
        {"Fn::GetAtt":["LoginURLS","AdminLogout"]},
        {"Ref":"AdminWebsiteLogoutResource"}
    ),
    "UserWebsiteResource":util.resource('user',{"Ref":"WebsiteResource"}),
    "UserWebsiteResourceGet":util.redirect(
        {"Fn::GetAtt":["LoginURLS","UserLogin"]},
        {"Ref":"UserWebsiteResource"}
    ),
    "UserWebsiteLogoutResource":util.resource('logout',{"Ref":"UserWebsiteResource"}),
    "UserWebsiteLogoutResourceGet":util.redirect(
        {"Fn::GetAtt":["LoginURLS","UserLogout"]},
        {"Ref":"UserWebsiteLogoutResource"}
    ),
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


