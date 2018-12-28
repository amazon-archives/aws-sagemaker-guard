var _=require('lodash')
module.exports={
  "schemaVersion": "0.3",
  "description": "Command Document Example JSON Template",
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
  ]
}
