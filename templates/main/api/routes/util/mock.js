var fs=require('fs')
var _=require('lodash')
module.exports=function(opts){
    return {
      "Type": "AWS::ApiGateway::Method",
      "Properties": {
        "AuthorizationType": opts.auth || "AWS_IAM",
        "HttpMethod": opts.method.toUpperCase(),
        "Integration": {
          "Type": "MOCK",
          "IntegrationResponses": [{
            "ResponseTemplates":opts.templates || {
                "application/json": {"Fn::Sub":opts.templateString || fs.readFileSync(opts.template,"utf8")}
            },
            "StatusCode":"200",
            "ResponseParameters":opts.responseParameters
          }],
          "RequestTemplates": {
            "application/json":"{\"statusCode\": 200}"
          }
        },
        "ResourceId":opts.resource,
        "MethodResponses": [_.pickBy({
            "StatusCode": 200,
            "ResponseParameters":_.mapValues(opts.responseParameters,x=>false)
        })],
        "RestApiId":{"Ref":"API"} 
      }
    }
}
