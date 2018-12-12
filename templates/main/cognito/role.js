module.exports={
"UserRole": {
  "Type": "AWS::IAM::Role",
  "Properties": {
    "AssumeRolePolicyDocument": {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
                "Federated": "cognito-identity.amazonaws.com"
          },
          "Action": "sts:AssumeRoleWithWebIdentity"
        }
      ]
    },
    "Path": "/",
    "ManagedPolicyArns": []
  }
},
"AdminRole": {
  "Type": "AWS::IAM::Role",
  "Properties": {
    "AssumeRolePolicyDocument": {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
                "Federated": "cognito-identity.amazonaws.com"
          },
          "Action": "sts:AssumeRoleWithWebIdentity"
        }
      ]
    },
    "Path": "/",
    "ManagedPolicyArns": []
  }
},
"RoleAttachment": {
    "Type": "Custom::CognitoRoleAttachment",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNCognitoRoleAttachmentLambda", "Arn"] },
        "IdentityPoolId":{"Ref":"IdPool"},
        "Roles":{
            "authenticated":{"Fn::GetAtt":["UserRole","Arn"]}
        },
        "RoleMappings":[{
            "ClientId":{"Ref":"AdminClient"},
            "UserPool":{"Fn::GetAtt":["QNA","Outputs.UserPool"]},
            "Type":"Rules",
            "AmbiguousRoleResolution":"Deny",
            "RulesConfiguration":{"Rules":[{
                "Claim":"cognito:groups",
                "MatchType":"Contains",
                "Value":"Admins",
                "RoleARN":{"Fn::GetAtt":["AdminRole","Arn"]}
            },{
                "Claim":"cognito:groups",
                "MatchType":"Contains",
                "Value":"User",
                "RoleARN":{"Fn::GetAtt":["UserRole","Arn"]}
            }]}
        }]
    }
},
"SyncPolicy": {
  "Type": "AWS::IAM::ManagedPolicy",
  "Properties": {
    "PolicyDocument": {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [   
            "cognito-sync:*"
          ],
          "Resource": [{"Fn::Sub":
            "arn:aws:cognito-sync:${AWS::Region}:${AWS::AccountId}:identitypool/${IdPool}/identity/*"
            }]
        }
      ]
    },
    "Roles":[{"Ref":"UserRole"},{"Ref":"AdminRole"}]
  }
}
}
