var _=require('lodash')
module.exports={
  "schemaVersion": "0.3",
  "description": "Command Document Example JSON Template",
  assumeRole:{"Fn::GetAtt":["SSMAutomationRole","Arn"]},
  "parameters": require('../params'),
  "mainSteps": [
    {
      "action": "aws:createStack",
      "name": "start",
      "inputs": {
        StackName:"{{StackName}}-bucket",
        TemplateURL:{"Fn::Sub":"https://s3.amazonaws.com/${AssetBucket}/${AssetPrefix}/bucket.json"},
        Capabilities:["CAPABILITY_IAM"],
        Parameters:[{
            ParameterValue:"{{RoleArn}}",
            ParameterKey:"RoleArn",
        },{
            ParameterValue:"{{StackName}}",
            ParameterKey:"NotebookInstance",
        }]
      }
    },
    {
      "action": "aws:runCommand",
      "name": "install",
      "inputs": {
        DocumentName:{"Ref":"BYODCommandDocument"},
        InstanceIds:["{{InstanceId}}"],
        OutputS3BucketName:"{{LogsBucket}}",
        OutputS3KeyPrefix:"BYOD",
        Parameters:{
            BucketStack:"{{StackName}}-bucket",
            Region:"{{global:REGION}}"
        }
      }
    }
  ]
}
