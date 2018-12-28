var fs=require('fs')

module.exports={
  "Resources": Object.assign(require('./cfn'),{
    "Bucket": {
      "Type": "AWS::S3::Bucket",
      "Properties": {
        "VersioningConfiguration":{
            "Status":"Enabled"
        },
        "LifecycleConfiguration":{
            "Rules":[{
                "Status":"Enabled",
                "NoncurrentVersionExpirationInDays":1
            }]
        }
      }
    },
    "Clear":{
        "Type": "Custom::S3Clear",
        "DependsOn":["CFNLambdaPolicy"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["S3ClearLambda", "Arn"] },
            "Bucket":{"Ref":"Bucket"}
        }
    },
    "RoleName":{
        "Type": "Custom::S3Clear",
        "DependsOn":["CFNLambdaPolicy"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["RoleNameLambda", "Arn"] },
            "Arn":{"Ref":"RoleArn"}
        }
    },
    "AccessPolicy":{
      "Type": "AWS::IAM::ManagedPolicy",
      "Properties": {
        "PolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "s3:*"
              ],
              "Resource":[
                {"Fn::Sub":"arn:aws:s3:::${Bucket}*"},
              ]
            },
            {
              "Effect": "Allow",
              "Action": [
                "cloudformation:DescribeStacks"
              ],
              "Resource":[
                {"Fn::Sub":"arn:aws:cloudformation:*:*:stack/${AWS::StackName}"},
              ]
            }
          ]
        },
        Roles:[{"Ref":"RoleName"}]
      }
    }
  }),
  "Conditions": {},
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "Bootstrap bucket for QnABot assets",
  "Mappings": {},
  "Outputs": {
    "Bucket": {
      "Value": {
        "Ref": "Bucket"
      }
    }
  },
  "Parameters": {
    "RoleArn":{
        "Type":"String"
    },
    "NotebookInstance":{
        "Type":"String"
    }
  },
  "Conditions":{
  }
}


