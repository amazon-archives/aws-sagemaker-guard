var fs=require('fs')
module.exports={
"UserPoolUI": {
  "Type": "Custom::CognitoUI",
  "Properties": {
    "ServiceToken": { "Fn::GetAtt" : ["CFNCognitoUILambda", "Arn"] },
    UserPoolId:{"Fn::GetAtt":["QNA","Outputs.UserPool"]}, 
    CSS:fs.readFileSync(`${__dirname}/style/style.css`,'utf-8'),
    ImageFile:{
        "Bucket":{"Ref":"AssetBucket"},
        "Key":{"Fn::Sub":"${AssetPrefix}/logo.jpg"},
    }
  }
},
"UserPoolUpdate": {
  "Type": "Custom::CognitoPoolUpdate",
  "Properties": {
    "ServiceToken": { "Fn::GetAtt" : ["CFNCognitoPoolUpdateLambda", "Arn"] },
    UserPoolId:{"Fn::GetAtt":["QNA","Outputs.UserPool"]}, 
    "AdminCreateUserConfig":{
        "AllowAdminCreateUserOnly":true,
        "InviteMessageTemplate":{
            "EmailSubject":"SageMaker-Gaurd Access Invitation",
            "EmailMessage":{"Fn::Sub":fs.readFileSync(__dirname+'/messages/invite.txt','utf8')},
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
    SmsAuthenticationMessage:"{####} is your authentication code for SageGuard",
    SmsConfiguration:{
        SnsCallerArn:{"Fn::GetAtt":["SNSCognitoRole","Arn"]},
        ExternalId:{"Ref":"AWS::StackName"}
    },
    AutoVerifiedAttributes:["email"],
    VerificationMessageTemplate:{
        DefaultEmailOption:"CONFIRM_WITH_LINK",
        EmailMessageByLink:{"Fn::Sub":fs.readFileSync(__dirname+'/messages/verify.txt','utf8')},
        EmailSubjectByLink:"SageGuard Email Verification",
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
