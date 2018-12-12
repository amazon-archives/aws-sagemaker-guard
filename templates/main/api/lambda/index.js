var fs=require('fs')
var UglifyJS = require("uglify-es");
var chalk=require('chalk')
var recursive = require('recursive-readdir-synchronous');
var _=require('lodash')
var len=__dirname.split('/').length
var lambdas=recursive(__dirname,['index.js'])
    .map(x=>{
        return x.split('/')
            .slice(len).join('/')
            .match(/(.*)\.js/)[1]
    })

var stateMachines=_.fromPairs(_.toPairs(require('../../../step_functions/step_functions'))
    .filter(x=>x[1].Type==="AWS::StepFunctions::StateMachine")
    .map(x=>[x[0].toUpperCase(),{"Fn::GetAtt":["StepFunctions",`Outputs.${x[0]}`]}]))
console.log(stateMachines)
module.exports=Object.assign(
    _.fromPairs(lambdas
        .map(name=>[`API${Name(name)}Lambda`,lambda(name)])),
    /*_.fromPairs(lambdas
        .map(name=>[`InvokePermission${Name(name)}Lambda`,permission(Name(name))])),*/
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
            "arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess",
            "arn:aws:iam::aws:policy/AmazonCloudDirectoryFullAccess",
            "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess",
            "arn:aws:iam::aws:policy/AmazonCognitoPowerUser",
            "arn:aws:iam::aws:policy/AWSLambdaFullAccess",
            "arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess",
            "arn:aws:iam::aws:policy/AWSStepFunctionsFullAccess",
        ],
        "Policies":[{
            "PolicyName":"KMS",
            PolicyDocument:{
                Version: "2012-10-17",
                Statement:{
                    Effect:"Allow",
                    Resource:"*",
                    Action:["kms:Describe*","kms:Get*","kms:List*","cloudformation:*","glue:*"]
                }
            }
        },{
            "PolicyName":"IAM",
            PolicyDocument:{
                Version: "2012-10-17",
                Statement:{
                    Effect:"Allow",
                    Resource:"*",
                    Action:["iam:Describe*","iam:Get*","iam:List*","firehose:*"]
                }
            }
        }]
      }
    },
    "UtilCodeVersion":{
        "Type": "Custom::S3Version",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNS3VersionLambda", "Arn"] },
            "Bucket": {"Ref":"AssetBucket"},
            "Key": {"Fn::Sub":"${AssetPrefix}/lambda/util.zip"},
            "BuildDate":(new Date()).toISOString()
        }
    },
    "AuthCodeVersion":{
        "Type": "Custom::S3Version",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNS3VersionLambda", "Arn"] },
            "Bucket": {"Ref":"AssetBucket"},
            "Key": {"Fn::Sub":"${AssetPrefix}/lambda/auth.zip"},
            "BuildDate":(new Date()).toISOString()
        }
    },
    "APIAuthLambda":{
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "S3Bucket":{"Ref":"AssetBucket"},
            "S3Key":{"Fn::Sub":"${AssetPrefix}/lambda/auth.zip"},
            "S3ObjectVersion":{"Ref":"AuthCodeVersion"},
        },
        "Handler": "index.handler",
        "MemorySize": "128",
        "Role": {"Fn::GetAtt": ["APILambdaRole","Arn"]},
        "Runtime": "nodejs6.10",
        "TracingConfig":{
            "Mode":"Active"
        },
        "Timeout": 60,
        "Tags":[{
            Key:"Type",
            Value:"ApiRouteHandler"
        }]
      }
    },
    "UtilLambdaLayer":{
      "Type": "AWS::Lambda::LayerVersion",
      "Properties": {
        Content:{
            "S3Bucket":{"Ref":"AssetBucket"},
            "S3Key":{"Fn::Sub":"${AssetPrefix}/lambda/util.zip"},
            "S3ObjectVersion":{"Ref":"UtilCodeVersion"},
        },
        LayerName:{"Fn::Sub":"${AWS::StackName}-util"},
      }
    }
})

function lambda(name){
    var code=fs.readFileSync(__dirname+`/${name}.js`,'utf-8')
    var result = UglifyJS.minify(code,{mangle:false})
    if(result.error) throw `${name} ${result.error}`
    if(result.code.length<4096){
        console.log(`API:${Name(name)}`, chalk.green(`${result.code.length}/4096`))
    }else{
        console.log(`API:${Name(name)}`, chalk.red(`${result.code.length}/4096`))
    }
    return {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":result.code
        },
        "Handler": "index.handler",
        "MemorySize": "1024",
        "Role": {"Fn::GetAtt": ["APILambdaRole","Arn"]},
        "Runtime": "nodejs6.10",
        Layers:[{"Ref":"UtilLambdaLayer"}],
        "Environment":{
            "Variables":Object.assign({
                DIRECTORY:{"Ref":"Directory"},
                SCHEMA:{"Fn::GetAtt":["Directory","AppliedSchemaArn"]},
                LOGINFIREHOSE:{"Ref":"LoginFirehose"},
                ESPROXY:{"Fn::GetAtt":["QNA","Outputs.ESProxyLambda"]},
                ESADDRESS:{"Fn::GetAtt":["QNA","Outputs.ElasticsearchEndpoint"]},
            },stateMachines)
        },
        "TracingConfig":{
            "Mode":"Active"
        },
        "Timeout": 60,
        "Tags":[{
            Key:"Type",
            Value:"ApiRouteHandler"
        }]
      }
    }
}
function Name(file){
    return file.replace('/','')
}
function permission(name){
    return {
      "Type": "AWS::Lambda::Permission",
      "Properties": {
        "Action": "lambda:InvokeFunction",
        "FunctionName":{"Fn::GetAtt":[`API${name}Lambda`,"Arn"]},
        "Principal": "apigateway.amazonaws.com"
      }
    }
}



