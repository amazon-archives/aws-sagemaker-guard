var _=require('lodash')
module.exports={
  "schemaVersion": "2.2",
  "description": "Command Document Example JSON Template",
  "parameters": require('../params'),
  "mainSteps": [
    {
      "action": "aws:runShellScript",
      "name": "example",
      "inputs": {
        "runCommand": [
          "echo 'hello'"
        ]
      }
    }
  ]
}
