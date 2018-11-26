var _=require('lodash')
var methods=[]
_.forEach(require('./routes'),(value,key)=>{
    value.Type==='AWS::ApiGateway::Method' ? methods.push(key) : null
})
var permissions=_.keys(require('./lambda')).filter(x=>x.match(/^InvokePermission/))

var lambdas=_.fromPairs(_.map(require('./lambda'),(value,key)=>{
    value.Type==='AWS::Lambda::Function' ? methods.push(key) : null
    return [key,{"Fn::GetAtt":[key,"Arn"]},value.Type]
})
.filter(x=>x[2]==='AWS::Lambda::Function')
)

module.exports=Object.assign(
    require('./roles'),
    require('./lambda'),
    require('./routes'),
    require('./auth'),
{
"API": {
  "Type": "AWS::ApiGateway::RestApi",
  "Properties": {
    "Name": {"Ref": "AWS::StackName"},
    "Description":"An Api interface for SageMaker Build"
  },
  "DependsOn":permissions 
},
"ApiCompression":{
    "Type": "Custom::ApiCompression",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNApiGatewayCompressionLambda", "Arn"] },
        "restApiId": {"Ref": "API"},
        "value":"500000"
    }
},
"Deployment":{
    "Type": "Custom::ApiDeployment",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNApiGatewayDeploymentLambda", "Arn"] },
        "restApiId": {"Ref": "API"},
        "buildDate":new Date(),
        "stage":{"Fn::GetAtt":["Constants","ApiStageName"]}
    },
    "DependsOn":methods
},
"Stage":{
  "Type": "AWS::ApiGateway::Stage",
  "Properties": {
    "DeploymentId": {"Ref": "Deployment"},
    "RestApiId": {"Ref": "API"},
    "StageName":{"Fn::GetAtt":["Constants","ApiStageName"]},
    "MethodSettings": [{
        "DataTraceEnabled": true,
        "HttpMethod": "*",
        "LoggingLevel": "INFO",
        "ResourcePath": "/*"
    }],
    "Variables":Object.assign({
        "UserPool":{"Ref":"UserPool"},
        "Region":{"Ref":"AWS::Region"},
        "DirectoryArn":{"Ref":"Directory"},
        "SchemaArn":{"Fn::GetAtt":["Directory","AppliedSchemaArn"]},
    },lambdas)
  }
},
"ApiGatewayAccount": {
  "Type": "AWS::ApiGateway::Account",
  "Properties": {
    "CloudWatchRoleArn": {
      "Fn::GetAtt": ["ApiGatewayCloudWatchLogsRole","Arn"]
    }
  }
}
})


