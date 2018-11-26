var fs=require('fs')
module.exports={
"UserPool": {
  "Type": "AWS::Cognito::UserPool",
  "Properties": {
    "UserPoolName": {"Fn::Sub":"Userpool-${AWS::StackName}"},
    "AdminCreateUserConfig":{
        "AllowAdminCreateUserOnly":true,
        "InviteMessageTemplate":{
            "EmailSubject":"SageMaker-Gaurd Access Invitation",
            "EmailMessage":{"Fn::Sub":fs.readFileSync(__dirname+'/invite.txt','utf8')},
        }
    },
    "AliasAttributes":["email"],
    "AutoVerifiedAttributes":["email"],
    "Schema":[{
        "Required":true,
        "Name":"email",
        "AttributeDataType":"String",
        "Mutable":true
    }],
    "LambdaConfig":{
        "PreSignUp":{"Fn::GetAtt":["SignupLambda","Arn"]},
        "PostAuthentication":{"Fn::GetAtt":["PostauthLambda","Arn"]}
    }
  }
},
"AdminClient": {
  "Type": "AWS::Cognito::UserPoolClient",
  "Properties": {
    "ClientName": {"Fn::Sub":"User"},
    "GenerateSecret": false,
    "UserPoolId": {"Ref": "UserPool"}
  }
},
"UserClient": {
  "Type": "AWS::Cognito::UserPoolClient",
  "Properties": {
    "ClientName": {"Fn::Sub":"Admin"},
    "GenerateSecret": false,
    "UserPoolId": {"Ref": "UserPool"}
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
        "ProviderName": {"Fn::GetAtt": ["UserPool","ProviderName"]},
        "ServerSideTokenCheck": true
      }
    ]
  }
},
"SignupPermision":{
    "Type" : "AWS::Lambda::Permission",
    "Properties" : {
        "Action" : "lambda:InvokeFunction",
        "FunctionName" : {"Fn::GetAtt":["SignupLambda","Arn"]},
        "Principal" : "cognito-idp.amazonaws.com",
        "SourceArn" : {"Fn::GetAtt":["UserPool","Arn"]}
    }
},
"PostauthPermision":{
    "Type" : "AWS::Lambda::Permission",
    "Properties" : {
        "Action" : "lambda:InvokeFunction",
        "FunctionName" : {"Fn::GetAtt":["PostauthLambda","Arn"]},
        "Principal" : "cognito-idp.amazonaws.com",
        "SourceArn" : {"Fn::GetAtt":["UserPool","Arn"]}
    }
},

}
