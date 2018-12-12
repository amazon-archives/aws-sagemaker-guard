module.exports={
"Admin":{
    "Type" : "AWS::Cognito::UserPoolUser",
    "DependsOn":["SignupPermision","Stage"],
    "Properties" : {
        "DesiredDeliveryMediums":["EMAIL"],
        "UserAttributes":[{
            "Name":"email",
            "Value":{"Ref":"AdminEmail"}
        },{
            "Name":"phone_number",
            "Value":{"Ref":"AdminPhoneNumber"}
        }],
        "Username":{"Ref":"AdminUsername"},
        "UserPoolId":{"Fn::GetAtt":["QNA","Outputs.UserPool"]}
    }
},
"AdminMFA": {
  "Type": "Custom::CognitoUserMFA",
  "Properties": {
    "ServiceToken": { "Fn::GetAtt" : ["CFNCognitoMFALambda", "Arn"] },
    UserPoolId:{"Fn::GetAtt":["QNA","Outputs.UserPool"]}, 
    Username: {"Ref":"AdminUsername"}
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
