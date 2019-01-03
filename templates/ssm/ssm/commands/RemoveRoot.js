var _=require('lodash')
module.exports={
  "schemaVersion": "2.2",
  "description": "Removes sudo permissions from ec2-user on SageMaker notebook instances",
  "parameters": require('../params'),
  "mainSteps": [
    {
      "action": "aws:runShellScript",
      "name": "example",
      "inputs": {
        "runCommand": [
          "rm /etc/sudoers.d/cloud-init"
        ]
      }
    }
  ],
  Tags:{
    "OnCreate":"false",
    "OnTerminate":"false",
    "OnStart":"true",
    "OnStop":"false"
  }
}
