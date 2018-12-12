var fs=require('fs')

module.exports={
    "PostauthPermision":{
        "Type" : "AWS::Lambda::Permission",
        "Properties" : {
            "Action" : "lambda:InvokeFunction",
            "FunctionName" : {"Fn::GetAtt":["PostauthLambda","Arn"]},
            "Principal" : "cognito-idp.amazonaws.com",
            "SourceArn" :{"Fn::Sub":"arn:aws:cognito-idp:${AWS::Region}:${AWS::AccountId}:userpool/${QNA.Outputs.UserPool}"} 
        }
    },
    "PostauthLambda": {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":fs.readFileSync(__dirname+'/handler.js','utf8')
        },
        "Handler": "index.handler",
        "MemorySize": "128",
        "Environment":{
            "Variables":{
                OBJECT_UPDATE_LAMBDA:{"Fn::GetAtt":["APICloudDirectoryObjectUpdateLambda","Arn"]} 
            }
        },
        "Role": {
          "Fn::GetAtt": [
            "PostauthLambdaRole",
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
    "PostauthLambdaRole": {
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
                    Resource:{"Fn::GetAtt":["APICloudDirectoryObjectUpdateLambda","Arn"]}
                }]
            }
        }]
      }
    }
}

