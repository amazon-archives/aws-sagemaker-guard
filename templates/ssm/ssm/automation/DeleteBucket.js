var _=require('lodash')
module.exports={
  "schemaVersion": "0.3",
  "description": "Deletes S3 bucket.",
  assumeRole:{"Fn::GetAtt":["SSMAutomationRole","Arn"]},
  "parameters":require('../params'),
  "mainSteps": [
    {
      "action": "aws:deleteStack",
      "name": "start",
      "inputs": {
        StackName:"{{StackName}}-bucket",
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
