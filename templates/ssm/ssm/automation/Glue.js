var _=require('lodash')
module.exports={
  "schemaVersion": "0.3",
  "description": {"Fn::Sub":"Creates a Glue Development Endpoint and configures the instance to be able to use it."},
  assumeRole:{"Fn::GetAtt":["SSMAutomationRole","Arn"]},
  "parameters": require('../params'),
  "mainSteps": [
    {
        "name":"choice",
        "action":"aws:branch",
        "inputs":{
            Choices:[{
                Variable:"{{Event}}",
                StringEquals:"Create",
                NextStep:"create"
            },{
                Variable:"{{Event}}",
                StringEquals:"Delete",
                NextStep:"delete"
            }]
        }
    },
    {
      "action": "aws:createStack",
      "name": "create",
      "nextStep":"install",
      "inputs": {
        StackName:"{{StackName}}-glue-endpoint",
        TemplateURL:{"Fn::Sub":"https://s3.amazonaws.com/${AssetBucket}/${AssetPrefix}/glue_dev_endpoint.json"},
        Capabilities:["CAPABILITY_IAM"],
        Parameters:[{
            ParameterValue:"{{SSMRoleArn}}",
            ParameterKey:"SSMRoleArn",
        },{
            ParameterValue:"{{RoleArn}}",
            ParameterKey:"RoleArn",
        },{
            ParameterValue:"{{LambdaUtilLayer}}",
            ParameterKey:"LambdaUtilLayer",
        },{
            ParameterValue:"{{SecurityGroupId}}",
            ParameterKey:"SecurityGroupId",
        },{
            ParameterValue:"{{SubnetId}}",
            ParameterKey:"SubnetId",
        },{
            ParameterValue:"{{VPC}}",
            ParameterKey:"VPC",
        }]
      }
    },
    {
      "action": "aws:runCommand",
      "name": "install",
      "isEnd":true,
      "inputs": {
        DocumentName:{"Ref":"GlueCommandDocument"},
        InstanceIds:["{{InstanceId}}"],
        OutputS3BucketName:"{{LogsBucket}}",
        OutputS3KeyPrefix:"CreateGlue",
        Parameters:{
            Region:"{{global:REGION}}",
            GlueDevEndpoint:"{{StackName}}-glue-endpoint"
        }
      }
    },
    {
      "action": "aws:deleteStack",
      "isEnd":true,
      "name": "delete",
      "inputs": {
        StackName:"{{StackName}}-glue-endpoint",
      }
    }
  ],
  Tags:{
    "OnStartStop":"true",
  }
}
