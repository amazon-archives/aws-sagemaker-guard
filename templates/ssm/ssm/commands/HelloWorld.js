var _=require('lodash')
module.exports={
  "schemaVersion": "2.2",
  "description": "Example Document to be used with SageGaurd",
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
  ],
    Tags:{
    "OnCreate":"true",
    "OnTerminate":"true",
    "OnStart":"true",
    "OnStop":"true"
  }
}
