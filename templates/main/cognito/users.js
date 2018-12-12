module.exports={
"Admin":{
    "Type" : "AWS::Cognito::UserPoolUser",
    "DependsOn":["SignupPermision","Stage"],
    "Properties" : {
        "DesiredDeliveryMediums":["EMAIL"],
        "UserAttributes":[{
            "Name":"email",
            "Value":{"Ref":"AdminEmail"}
        }],
        "Username":{"Ref":"AdminUsername"},
        "UserPoolId":{"Fn::GetAtt":["QNA","Outputs.UserPool"]}
    }
},
"UserToGroup":{
  "Type" : "AWS::Cognito::UserPoolUserToGroupAttachment",
  "Properties" : {
    "GroupName" : "Admins",
    "Username" : {"Ref":"Admin"},
    "UserPoolId" : {"Fn::GetAtt":["QNA","Outputs.UserPool"]}
  }
}

}
