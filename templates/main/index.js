var fs=require('fs')
var _=require('lodash')

var files=fs.readdirSync(`${__dirname}`)
    .filter(x=>!x.match(/README.md|Makefile|index|test|bin|config|build/))
    .map(x=>require(`./${x}`))

module.exports={
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "Manage fleets of SageMaker notebook instances through AWS Systems Manage and Cognito single sign on",
  "Parameters":{
    "CidrBlock":{
        "Type":"String",
        "Default":"10.0.1.0/24"
    },
    "AssetBucket":{
        "Type":"String",
    },
    "AssetPrefix":{
        "Type":"String",
    },
    "AdminUsername":{
        "Type":"String",
        "Description":"The username for the administrator",
        "Default":"Admin"
    },
    "AdminEmail":{
        "Type":"String",
        "Description":"Email for Administrator. will be used to setup initial password to log into admin ui"
    },
    "VPCEndpoints":{
        "Type":"String",
        "Default":"ENABLE"
    }
  },
  "Outputs":{
    "WebsiteBucket":{
        "Value":{"Ref":"WebsiteBucket"}
    },
    "AdminLoginUrl":{
        "Value":{"Fn::Sub":"${ApiUrl.href}/login/admin"},
        "Description":""
    },
    "UserLoginUrl":{
        "Value":{"Fn::Sub":"${ApiUrl.href}/login/user"},
        "Description":""
    },
    "APIUrl":{
        "Value":{"Fn::Sub":"${ApiUrl.href}"},
        "Description":""
    }
  },
  "Resources":_.assign.apply({},files),
  "Conditions":_.fromPairs(_.toPairs(params)
        .filter(x=>x[1].Default)
        .map(x=>[`If${x[0]}`, {"Fn::Not":[{"Fn::Equals":[{"Ref":x[0]},x[1].Default]}]}])
  ),
  "Metadata":{
    "AWS::CloudFormation::Interface":{
    "ParameterGroups":[{
        "Label":{"default":"Adminstrator Settings"},
        "Parameters":["AdminEmail","AdminUsername"]
    },{
        "Label":{"default":"[Do No Change] Asset Configuration"},
        "Parameters":["AssetBucket","AssetPrefix"]
    }],
    "ParameterLabels":{
        "AdminEmail":{"default":"Email Address"},
        "AdminUsername":{"default":"Username"},
        "AssetBucket":{"default":"Asset Bucket"},
        "AssetPrefix":{"default":"Asset Prefix"}
    }
}
  }
}
var r=_.fromPairs(_.sortBy(
    _.toPairs(_.countBy(_.values(module.exports.Resources).map(x=>x.Type))),
    x=>x[1]
))
console.log(r)

