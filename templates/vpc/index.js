var fs=require('fs')
var _=require('lodash')

var files=fs.readdirSync(`${__dirname}`)
    .filter(x=>!x.match(/README.md|Makefile|index|test|bin|config|build/))
    .map(x=>require(`./${x}`))
var params=_.fromPairs(Object.keys(require('../main/vpc').VPC.Properties.Parameters).map(x=>[x,{"Type":"String","Default":"EMPTY"}]))

module.exports={
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "VPC environment for SageMaker-guard",
  "Parameters":params,
  "Conditions":_.fromPairs(_.toPairs(params)
        .filter(x=>x[1].Default)
        .map(x=>x[0])
        .map(x=>[`If${x}`, {"Fn::Not":[{"Fn::Equals":[{"Ref":x},"EMPTY"]}]}])
        .concat([[`IfEnableVPCEndpoints`, {"Fn::Equals":[{"Ref":"EnableVPCEndpoints"},"ENABLE"]}]])
  ),
  "Outputs":{
    "Subnet":{"Value":{"Ref":"subnet1"}}, 
    "NoteBookSecurityGroup":{"Value":{"Ref":"NoteBookSecurityGroup"}}, 
    "EFS":{"Value":{"Ref":"EFS"}}, 
    "VPC":{"Value":{"Ref":"VPC"}}, 
  },
  "Resources":_.assign.apply({},files)
}

