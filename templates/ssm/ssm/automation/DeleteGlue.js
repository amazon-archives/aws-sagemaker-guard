var _=require('lodash')
module.exports={
  "schemaVersion": "0.3",
  "description": "Deletes Glue Development endpoint",
  assumeRole:{"Fn::GetAtt":["SSMAutomationRole","Arn"]},
  "parameters":require('../params'),
  "mainSteps": [
    {
      "action": "aws:deleteStack",
      "name": "start",
      "inputs": {
        StackName:"{{StackName}}-glue-endpoint",
      }
    }
  ],
  "Tags":{
    "OnCreate":"false",
    "OnTerminate":"false",
    "OnStart":"false",
    "OnStop":"true"
  }
}
