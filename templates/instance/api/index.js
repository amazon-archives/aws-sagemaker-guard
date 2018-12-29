var fs=require('fs')

var _=require('lodash')
var lambdas=fs.readdirSync(__dirname)
    .filter(x=>!x.match(/index.js/))
    .map(x=>[`API${x.match(/(.*)\.js/)[1]}Lambda`,lambda(x)])

module.exports=Object.assign(
    _.fromPairs(lambdas),
{
    "APILambdaRole":{
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
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
            "arn:aws:iam::aws:policy/AmazonSSMFullAccess",
            {"Ref":"APIPolicy"}
        ]
      }
    },
    "APIPolicy":{
      "Type": "AWS::IAM::ManagedPolicy",
      "Properties": {
        "PolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [{
              "Effect": "Allow",
              "Action": [
                "lambda:InvokeFunction"
              ],
              "Resource": [
                "*"
              ]
            }]
        }
      }
    }
})

function lambda(name){
    var code=fs.readFileSync(__dirname+`/${name}`,'utf-8')
    return {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":code
        },
        "Handler": "index.handler",
        "MemorySize": "128",
        Layers:[{"Ref":"LambdaUtilLayer"}],
        "Role": {"Fn::GetAtt": ["APILambdaRole","Arn"]},
        "Environment":{
            "Variables":{
                NOTEBOOK:{"Ref":"SageMakerNotebookInstance"},
                ONSTART:{"Ref":"OnStartDocument"},
                ONSTOP:{"Ref":"OnStopDocument"},
                INSTANCEID:{"Fn::GetAtt":["WaitConditionData","id"]},
                STACKNAME:{"Ref":"AWS::StackName"}
            }
        },
        "Runtime": "nodejs6.10",
        "Timeout": 60
      }
    }
}




