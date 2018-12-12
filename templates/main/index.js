var fs=require('fs')
var _=require('lodash')

var files=fs.readdirSync(`${__dirname}`)
    .filter(x=>!x.match(/README.md|Makefile|index|test|bin|config|build/))
    .map(x=>require(`./${x}`))

var params={
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
    "AdminPhoneNumber":{
        "Type":"String",
        "AllowedPattern":"^\\+[0-9]{11}$",
        "ConstraintDescription":"must be in a format like +12345678901",
        "Description":"Admin Phone Number used for MFA"
    },
    "VPCEndpoints":{
        "Type":"String",
        "Default":"ENABLE",
        "Description":"Enable or Disable creation of VPC endpoints. You must enable endpoints if you want to disable direct internet access to notebook instances",
        "AllowedValues":["ENABLE","DISABLE"]
    }
  }
module.exports={
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "Manage fleets of SageMaker notebook instances through AWS Systems Manage and Cognito single sign on",
  "Parameters":params,
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
        "Parameters":["AdminEmail","AdminUsername","AdminPhoneNumber"]
    },{
        "Label":{"default":"Advanced Configuration"},
        "Parameters":["VPCEndpoints"]
    },{
        "Label":{"default":"[Do No Change] Asset Configuration"},
        "Parameters":["AssetBucket","AssetPrefix"]
    }],
    "ParameterLabels":{
        "AdminEmail":{"default":"Admin Email Address"},
        "AdminUsername":{"default":"Admin Username"},
        "AdminPhoneNumber":{"default":"Admin Phone Number"},
        "AssetBucket":{"default":"Asset Bucket"},
        "AssetPrefix":{"default":"Asset Prefix"},
        "VPCEndpoints":{"default":"Enable/Disable VPC Endpoint creation"}
    }
}
  }
}
var r=_.fromPairs(_.sortBy(
    _.toPairs(_.countBy(_.values(module.exports.Resources).map(x=>x.Type))),
    x=>x[1]
))
console.log(r)

