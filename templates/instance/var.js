module.exports={
"RoleName":{
    "Type": "Custom::RoleName",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["RoleNameLambda", "Arn"] },
        "Arn":{"Ref":"RoleArn"},
    }
}
}
