var _=require('lodash')
module.exports={
  "schemaVersion": "0.3",
  "description": {"Fn::Sub":"Creates an S3 bucket and add permissions fo the notebook to access the document."},
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
      "action": "aws:deleteStack",
      "name": "delete",
      "isEnd":true,
      "inputs": {
        StackName:"{{StackName}}-bucket",
      }
    }
  ],
  Tags:{
    "OnCreateDelete":"true",
  }
}
