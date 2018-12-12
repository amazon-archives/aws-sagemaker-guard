var fs=require('fs')
module.exports={
"UserPoolUpdate": {
  "Type": "Custom::CognitoPoolUpdate",
  "Properties": {
    "ServiceToken": { "Fn::GetAtt" : ["CFNCognitoPoolUpdateLambda", "Arn"] },
    UserPoolId:{"Fn::GetAtt":["QNA","Outputs.UserPool"]}, 
    "AdminCreateUserConfig":{
        "AllowAdminCreateUserOnly":true,
        "InviteMessageTemplate":{
            "EmailSubject":"SageMaker-Gaurd Access Invitation",
            "EmailMessage":{"Fn::Sub":fs.readFileSync(__dirname+'/invite.txt','utf8')},
        }
    },
    "LambdaConfig":{
        "PreSignUp":{"Fn::GetAtt":["SignupLambda","Arn"]},
        "PostAuthentication":{"Fn::GetAtt":["PostauthLambda","Arn"]}
    },
    UserPoolAddOns:{
        AdvancedSecurityMode:"ENFORCED"
    },
    MfaConfiguration:"OPTIONAL",
    SmsConfiguration:{
        SnsCallerArn:{"Fn::GetAtt":["SNSCognitoRole","Arn"]},
        ExternalId:{"Ref":"AWS::StackName"}
    }
  }
},
"AdminClient": {
  "Type": "AWS::Cognito::UserPoolClient",
  "Properties": {
    "ClientName": {"Fn::Sub":"User"},
    "GenerateSecret": false,
    "UserPoolId": {"Fn::GetAtt":["QNA","Outputs.UserPool"]}
  }
},
"UserClient": {
  "Type": "AWS::Cognito::UserPoolClient",
  "Properties": {
    "ClientName": {"Fn::Sub":"Admin"},
    "GenerateSecret": false,
    "UserPoolId": {"Fn::GetAtt":["QNA","Outputs.UserPool"]}
  }
},
"IdPool": {
  "Type": "AWS::Cognito::IdentityPool",
  "Properties": {
    "IdentityPoolName": "UserPool",
    "AllowUnauthenticatedIdentities":false,
    "CognitoIdentityProviders": [
      {
        "ClientId": {"Ref": "AdminClient"},
        "ProviderName": {"Fn::Sub":"cognito-idp.${AWS::Region}.amazonaws.com/${QNA.Outputs.UserPool}"},
        "ServerSideTokenCheck": true
      }
    ]
  }
},
}
