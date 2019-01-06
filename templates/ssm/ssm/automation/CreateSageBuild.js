var _=require('lodash')
module.exports={
  "schemaVersion": "0.3",
  "description": {"Fn::Sub":"OnCreate Document. Installs and configures the aws-sagemaker-build project on the instance. Set the OnTerminate document to 'DeleteSageBuild' to properly clean up."},
  assumeRole:{"Fn::GetAtt":["SSMAutomationRole","Arn"]},
  "parameters": require('../params'),
  "mainSteps": [
    {
      "action": "aws:createStack",
      "name": "start",
      "nextStep":"describeStack",
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
        "name":"describeStack",
        "action":"aws:executeAwsApi",
        "nextStep":"install",
        inputs:{
            Service:"cloudformation",
            Api:"DescribeStacks",
            StackName:"{{StackName}}-bucket"
        },
        outputs:[{
            Name:"Bucket",
            Type:"String",
            Selector:"$.Stacks[0].Outputs[0].OutputValue"
        }]
    },
    {
      "action": "aws:runCommand",
      "name": "install",
      "nextStep":"startSageBuild",
      "inputs": {
        DocumentName:{"Ref":"SageBuildCommandDocument"},
        InstanceIds:["{{InstanceId}}"],
        OutputS3BucketName:"{{LogsBucket}}",
        OutputS3KeyPrefix:"SageBuild",
        Parameters:{
            Bucket:"aws-machine-learning-blog",
            Region:"{{global:REGION}}",
            Prefix:"artifacts/sagebuild/v1",
            StackName:"{{StackName}}-SageBuild"
        }
      }
    },
    {
      "action": "aws:createStack",
      "name": "startSageBuild",
      "inputs": {
        StackName:"{{StackName}}-SageBuild",
        TemplateURL:"https://s3.amazonaws.com/aws-machine-learning-blog/artifacts/sagebuild/v1/template.json",
        Capabilities:["CAPABILITY_IAM"],
        Parameters:[{
            ParameterValue:"NONE",
            ParameterKey:"NoteBookInstanceType",
        },{
            ParameterValue:"{{describeStack.Bucket}}",
            ParameterKey:"ExternalDataBucket",
        },{
            ParameterValue:"{{describeStack.Bucket}}",
            ParameterKey:"AssetBucket",
        },{
            ParameterValue:"SageBuild",
            ParameterKey:"AssetPrefix",
        }]
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
