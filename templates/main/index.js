var fs=require('fs')
var _=require('lodash')

var files=fs.readdirSync(`${__dirname}`)
    .filter(x=>!x.match(/README.md|Makefile|index|test|bin|config|build/))
    .map(x=>require(`./${x}`))

var params={
    "CidrBlock":{
        "Type":"String",
        "Default":"10.0.1.0/24",
        "Description":"CIDR block to use for the VPC. choose carefully if you are going to peer the VPC in this stack with another one",
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
        "Description":"will be used to setup initial password to log into admin interface"
    },
    "AdminPhoneNumber":{
        "Type":"String",
        "AllowedPattern":"^\\+[0-9]{11}$",
        "ConstraintDescription":"must be in a format like +18005550100",
        "Description":"Admin Phone Number used for multi factor authentication"
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
        "Value":{"Fn::GetAtt":["URLs","AdminLogin"]},
        "Description":""
    },
    "UserLoginUrl":{
        "Value":{"Fn::GetAtt":["URLs","UserLogin"]},
        "Description":""
    },
    "APIUrl":{
        "Value":{"Fn::GetAtt":["URLs","API"]},
        "Description":""
    }
  },
  "Resources":_.assign.apply({},files),
  "Conditions":_.fromPairs(_.toPairs(params)
        .filter(x=>x[1].Default)
        .map(x=>[`If${x[0]}`, {"Fn::Not":[{"Fn::Equals":[{"Ref":x[0]},x[1].Default]}]}])
  ),
  "Mappings":{
    "RegionMap":{
        "us-east-2":{"name":"US East (Ohio)"},  
        "us-east-1":{"name":"US East (N. Virginia)"},
        "us-west-1":{"name":"US West (N. California)"},   
        "us-west-2":{"name":"US West (Oregon)"},
        "ap-south-1":{"name":"Asia Pacific (Mumbai)"},
        "ap-northeast-3":{"name":"Asia Pacific (Osaka-Local)"},
        "ap-northeast-2":{"name":"Asia Pacific (Seoul)"},
        "ap-southeast-1":{"name":"Asia Pacific (Singapore)"},
        "ap-southeast-2":{"name":"Asia Pacific (Sydney)"},
        "ap-northeast-1":{"name":"Asia Pacific (Tokyo)"},  
        "ca-central-1":{"name":"Canada (Central)"},
        "cn-north-1":{"name":"China (Beijing)"},
        "cn-northwest-1":{"name":"China (Ningxia)"},
        "eu-central-1":{"name":"EU (Frankfurt)"}, 
        "eu-west-1":{"name":"EU (Ireland)"},
        "eu-west-2":{"name":"EU (London)"},
        "eu-west-3":{"name":"EU (Paris)"},
        "eu-north-1":{"name":"EU (Stockholm)"},
        "sa-east-1":{"name":"South America (São Paulo)"},
        "us-gov-east-1":{"name":"AWS GovCloud (US-East)"},  
        "us-gov-west-1":{"name":"AWS GovCloud (US)"}
    }
  },
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

