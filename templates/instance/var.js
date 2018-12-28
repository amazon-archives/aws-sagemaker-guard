module.exports={
    "Role":{
        "Type": "Custom::RoleName",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["VariableLambda", "Arn"] },
            "Arn":{"Fn::If":["IfCreateRole",
                {"Fn::GetAtt":["DefaultNotebookRole","Arn"]},
                {"Ref":"RoleArn"},
            ]}
        }
    },
    "DefaultNotebookRole":{
      "Type": "AWS::IAM::Role",
      "Condition":"IfCreateRole",
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
