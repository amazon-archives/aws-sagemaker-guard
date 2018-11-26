var fs=require('fs')
var _=require('lodash')

var files=fs.readdirSync(`${__dirname}`)
    .filter(x=>!x.match(/README.md|Makefile|index|test|bin|config|build/))
    .map(x=>require(`./${x}`))
var params=_.fromPairs(Object.keys(require('../main/step_functions').StepFunctions.Properties.Parameters).map(x=>[x,{"Type":"String"}]))

module.exports={
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "Allow logged in Users to access AWS Console in other accounts",
  "Parameters":params,
  "Outputs":_.fromPairs(Object.keys(require('./step_functions/stateMachines').StateMachine)
    .map(x=>[x,{
        Value:{"Ref":x}
    }])),
  "Resources":Object.assign({
    "ClearStacks":{
        "Type": "Custom::ClearStacks",
        "DependsOn":["CFNLambdaRole","StateMachineClearStacks"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNLaunchStepFunctionLambda", "Arn"] },
            "Delete":{"Ref":"StateMachineClearStacks"},
            "StackName":{"Ref":"StackName"}
        }
    }
  },_.assign.apply({},files))
}

