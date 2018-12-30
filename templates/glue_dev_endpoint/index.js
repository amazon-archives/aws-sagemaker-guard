var fs=require('fs')
var _=require('lodash')

var params=require('./params')

module.exports={
  "Parameters":params,
  "Conditions":{},
  "Outputs":{
    "RoleArn":{
        "Value":{"Fn::GetAtt":["EndpointRole","Arn"]}
    },
    "EndpointName":{
        "Value":{"Ref":"GlueDevEndpoint"}
    }
  },
  "Resources":Object.assign({},
    require('./cfn'),
    require('./endpoint')
  ),
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description":"",
}
