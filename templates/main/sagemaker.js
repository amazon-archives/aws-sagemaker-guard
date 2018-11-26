var _=require('lodash')

module.exports={
 "DefaultNotebookRole":{
      "Type": "AWS::IAM::Role",
      "Properties":{
            "AssumeRolePolicyDocument": {
              "Version": "2012-10-17",
              "Statement": [
                {
                  "Effect": "Allow",
                  "Principal": {
                    "Service": "sagemaker.amazonaws.com"
                  },
                  "Action": "sts:AssumeRole"
                }
              ]
            },
            "Path": "/",
            "ManagedPolicyArns":[
                "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"
            ]
          }
    }   
}

