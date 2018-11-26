var fs=require('fs')

module.exports={
    "SignupPermision":{
        "Type" : "AWS::Lambda::Permission",
        "Properties" : {
            "Action" : "lambda:InvokeFunction",
            "FunctionName" : {"Fn::GetAtt":["SignupLambda","Arn"]},
            "Principal" : "cognito-idp.amazonaws.com",
            "SourceArn" : {"Fn::GetAtt":["UserPool","Arn"]}
        }
    },
    "SignupLambda": {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":fs.readFileSync(__dirname+'/handler.js','utf8')
        },
        "Handler": "index.handler",
        "MemorySize": "128",
        "Environment":{
            "Variables":{
                OBJECT_CREATE_LAMBDA:{"Fn::GetAtt":["APICloudDirectoryObjectCreateLambda","Arn"]} 
            }
        },
        "Role": {
          "Fn::GetAtt": [
            "SignupLambdaRole",
            "Arn"
          ]
        },
        "Runtime": "nodejs6.10",
        "Timeout": 300,
        "Tags":[{
            Key:"Type",
            Value:"Cognito"
        }]
      }
    },
    "SignupLambdaRole": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": "lambda.amazonaws.com"
              },
              "Action": "sts:AssumeRole"
            }
          ]
        },
        "Path": "/",
        "ManagedPolicyArns": [
          "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        ],
        "Policies":[{
            PolicyName:"LambdaInvoke",
            PolicyDocument:{
                Version:"2012-10-17",
                Statement:[{
                    Effect:"Allow",
                    Action:"Lambda:InvokeFunction",
                    Resource:{"Fn::GetAtt":["APICloudDirectoryObjectCreateLambda","Arn"]}
                }]
            }
        }]
      }
    }
}

