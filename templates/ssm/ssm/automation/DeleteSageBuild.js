var _=require('lodash')
module.exports={
  "schemaVersion": "0.3",
  "description": "Deletes S3 bucket.",
  assumeRole:{"Fn::GetAtt":["SSMAutomationRole","Arn"]},
  "parameters":require('../params'),
  "mainSteps": [
    {
      "action": "aws:deleteStack",
      "name": "deleteBucket",
      "nextStep":"deleteSageBuild",
      "inputs": {
        StackName:"{{StackName}}-bucket",
      }
    },
    {
      "action": "aws:deleteStack",
      "name": "deleteSageBuild",
      "inputs": {
        StackName:"{{StackName}}-SageBuild",
      }
    }
  ],
  "Tags":{
    "OnCreate":"false",
    "OnTerminate":"true",
    "OnStart":"false",
    "OnStop":"false"
  }
}
