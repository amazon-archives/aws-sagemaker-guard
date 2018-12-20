var clean=require('clean-deep')
var fs=require('fs')
var _=require('lodash')
var error_template=fs.readFileSync(__dirname+"/error.vm",'utf8')


module.exports=function(params){
    return clean({
    "Type": "AWS::ApiGateway::Method",
    "Properties": {
        "AuthorizationType":params.authorization || "AWS_IAM",
        "AuthorizerId":params.authorizerId,
        "HttpMethod": params.method.toUpperCase(),
        "Integration": {
          "Type": params.type || "AWS",
          "IntegrationHttpMethod": "POST",
          "Uri": {"Fn::Sub":`arn:aws:apigateway:\${AWS::Region}:lambda:path/2015-03-31/functions/\${${params.lambda}.Arn}/invocations`},
          "IntegrationResponses": _.concat({   
                "StatusCode": params.defaultResponse || 200,
                "ResponseParameters":_.get(params,"parameters.response"),
                "ResponseTemplates":{
                    "application/json":{"Fn::Sub":params.res}
                }
            },{   
                "SelectionPattern":".*[InternalServiceError].*",
                "StatusCode": 500,
                "ResponseTemplates":{
                    "application/json":{"Fn::Sub":error_template}
                }
            },{   
                "SelectionPattern":".*[BadRequest].*",
                "StatusCode": 400,
                "ResponseTemplates":{
                    "application/json":{"Fn::Sub":error_template}
                }
            },{   
                "SelectionPattern":".*[Conflict].*",
                "StatusCode": 409,
                "ResponseTemplates":{
                    "application/json":{"Fn::Sub":error_template}
                }
            },{   
                "SelectionPattern":".*[NotFound].*",
                "StatusCode": 404,
                "ResponseTemplates":{
                    "application/json":{"Fn::Sub":error_template}
                }
            }
          ),
          "Credentials":{"Ref":"ApiGatewayRole"},
          "RequestParameters":_.get(params,"parameter.names"),
          "RequestTemplates": {
            "application/json":{"Fn::Sub":params.req}
          }
        },
        "RequestParameters":_.get(params,"parameter.locations"),
        "ResourceId": params.resource,
        "MethodResponses": [
          {
            "StatusCode": params.defaultResponse || 200,
            "ResponseParameters":Object.assign(
                {},
                _.mapValues(_.get(params,"parameters.response",{}),x=>false))
          },
          {
            "StatusCode": 404
          },
          {
            "StatusCode": 409
          },
          {
            "StatusCode": 400
          },
          {
            "StatusCode": 500
          }
        ],
        "RestApiId":{"Ref":"API"}
      }
    },{
        emptyStrings:false 
    })
}


    
