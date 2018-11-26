module.exports={
"Users":{
  "Type" : "AWS::Cognito::UserPoolGroup",
  "Properties" : {
    "GroupName" : "Users",
    "UserPoolId": {"Ref": "UserPool"}
  }
},
"Admins":{
  "Type" : "AWS::Cognito::UserPoolGroup",
  "DependsOn":["SignupPermision"],
  "Properties" : {
    "GroupName" : "Admins",
    "UserPoolId": {"Ref": "UserPool"}
  }
},
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
        "UserPoolId":{"Ref":"UserPool"}
    }
},
"UserToGroup":{
  "Type" : "AWS::Cognito::UserPoolUserToGroupAttachment",
  "Properties" : {
    "GroupName" : {"Ref":"Admins"},
    "Username" : {"Ref":"Admin"},
    "UserPoolId" : {"Ref":"UserPool"}
  }
}

}
