var _=require('lodash')
module.exports={
  "schemaVersion": "2.2",
  "description": "Command Document Example JSON Template",
  "parameters": Object.assign(_.fromPairs(_.keys(require('../../instance/params'))
    .map(x=>[x,{
        "type": "String",
        "description": x.Description || "Example",
        "default":x.Default || "Hello World"
    }])),
    {
        StackName:{
            type:"String"
        }
    }
  ),
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
