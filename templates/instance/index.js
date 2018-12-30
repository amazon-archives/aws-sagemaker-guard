var fs=require('fs')
var _=require('lodash')

var params=require('./params')

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
            "IfCreateRole",
            {"Fn::Equals":[{"Ref":"RoleArn"},"CREATE"]}
        ],[
            "IfSecurityGroupId",
            {"Fn::Not":[{"Fn::Equals":[{"Ref":"SecurityGroupId"},""]}]}
        ],[
            "TurnOff",
            {"Fn::Equals":[{"Ref":"State"},"OFF"]}
        ],[
            "TurnOn",
            {"Fn::Equals":[{"Ref":"State"},"ON"]}
        ],[
            "IfDisableDirectInternet",
            {"Fn::Not":[{"Fn::Equals":[{"Ref":"DirectInternetAccess"},"Enabled"]}]}
        ]])
  ),
  "Outputs":Object.assign({
    "NoteBookName":{
        "Value":{"Fn::GetAtt":["SageMakerNotebookInstance","NotebookInstanceName"]}
    },
    "InstanceID":{
        "Value":{"Fn::GetAtt":["WaitConditionData","id"]}
    },
    "JupyterProxyCFNLambda":{
        "Value":{ "Fn::GetAtt" : ["JupyterApiProxyLambda", "Arn"] }
    },
    "RoleArn":{
        "Value":{"Fn::GetAtt":["Role","Arn"]}
    },
  },_.fromPairs(
        _.keys(_.omit(params,["RoleArn"]))
    .map(x=>[x,{"Value":{"Ref":x}}]))
  ),
  "Resources":Object.assign({},
    require('./cfn'),
    require('./SageMakerNotebook'),
    require('./cloudwatch'),
    require('./var'),
    require('./api')
  ),
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description":"",
  
}
