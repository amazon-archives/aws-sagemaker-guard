var fs=require('fs')
var _=require('lodash')

var params={
    ParentStack:{
        "Type":"String"
    },
    SSMLogGroup:{
        "Type":"String"
    },
    LogsBucket:{
        "Type":"String"
    },
    "EFS":{
        "Type":"String"
    },
    "InstanceType":{
        "Type":"String"
    },
    "RoleArn":{
        "Type":"String"
    },
    "KmsKeyId":{
        "Type":"String",
        "Default":"EMPTY"
    },
    "SecurityGroupId":{
        "Type":"String",
    },
    "SubnetId":{
        "Type":"String",
    },
    "DirectInternetAccess":{
        "Type":"String",
        "Default":"Enabled"
    },
    "IdleShutdown":{
        "Type":"String",
        "Default":"30"
    }
}

module.exports={
  "Parameters":params,
  "Conditions":_.fromPairs(_.toPairs(params)
        .filter(x=>x[1].Default)
        .map(x=>x[0])
        .map(x=>[`If${x}`, 
            x.Type==="CommaDelimitedList" ?
                {"Fn::Not":[{"Fn::Equals":[{"Fn::Join":["",{"Ref":x}]},""]}]}:
                {"Fn::Not":[{"Fn::Equals":[{"Ref":x},"EMPTY"]}]}
            ]
        ).concat([[
            "IfSecurityGroupId",
            {"Fn::Not":[{"Fn::Equals":[{"Ref":"SecurityGroupId"},""]}]}
        ],[
            "IfDisableDirectInternet",
            {"Fn::Not":[{"Fn::Equals":[{"Ref":"DirectInternetAccess"},"Enabled"]}]}
        ]])
  ),
  "Outputs":{
    "NoteBookName":{
        "Value":{"Fn::GetAtt":["SageMakerNotebookInstance","NotebookInstanceName"]}
    },
    "InstanceID":{
        "Value":{"Fn::GetAtt":["WaitConditionData","id"]}
    }
  },
  "Resources":Object.assign({},
    require('./cfn'),
    require('./SageMakerNotebook'),
    require('./cloudwatch')
  ),
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description":"",
  
}
console.log(JSON.stringify(module.exports.Conditions))
