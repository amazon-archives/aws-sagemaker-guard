var fs=require('fs')

var _=require('lodash')

module.exports={
    "SSMAutomationRole":{
      "Type": "AWS::IAM::Role",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": [               
                    "ec2.amazonaws.com",
                    "ssm.amazonaws.com"
                ]
              },
              "Action": "sts:AssumeRole"
            }
          ]
        },
        "Path": "/",
        "ManagedPolicyArns": [
            "arn:aws:iam::aws:policy/service-role/AmazonSSMAutomationRole",
            "arn:aws:iam::aws:policy/AdministratorAccess"
        ]
      }
    }
}
