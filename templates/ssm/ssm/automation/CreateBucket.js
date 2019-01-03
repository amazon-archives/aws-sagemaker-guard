var _=require('lodash')
module.exports={
  "schemaVersion": "0.3",
  "description": {"Fn::Sub":"Creates an S3 bucket and add permissions fo the notebook to access the document. Pair with DeleteBucket to properly clean up bucket when the instance is terminated"},
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
    }
  ],
  Tags:{
    "OnCreate":"true",
    "OnTerminate":"false",
    "OnStart":"false",
    "OnStop":"false"
  }
}
