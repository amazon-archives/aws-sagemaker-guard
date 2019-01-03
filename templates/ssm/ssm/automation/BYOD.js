var _=require('lodash')
module.exports={
  "schemaVersion": "0.3",
  "description": {"Fn::Sub":"OnCreate Document. Installs and configures the aws-samples/amazon-sagemaker-BYOD-template project on the instance. Set the OnTerminate document to 'DeleteBucket' to properly clean up."},
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
  ],
  Tags:{
    "OnCreate":"true",
    "OnTerminate":"false",
    "OnStart":"false",
    "OnStop":"false"
  }
}
