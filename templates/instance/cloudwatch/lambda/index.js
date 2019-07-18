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


module.exports=Object.assign(
    _.fromPairs(lambdas
        .map(name=>[`CloudWatch${Name(name)}Lambda`,lambda(name)])),
    Object.assign.apply({},lambdas.map(permission)),
{
    "CloudWatchLambdaRole":{
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
            "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"
        ],
        "Policies":[{
            "PolicyName":"Access",
            "PolicyDocument": {
              "Version": "2012-10-17",
              "Statement": [{
                    Effect:"Allow",
                    Action:[
                        "cloudformation:*",
                    ],
                    "Resource":{"Fn::Sub":"arn:aws:cloudformation:${AWS::Region}:${AWS::AccountId}:stack/${AWS::StackName}/*"}
              },{
                    Effect:"Allow",
                    Action:[
                        "cloudformation:DescribeStacks",
                    ],
                    "Resource":"*"
              }]
            }
        }]
      }
    }
})

function lambda(name){
    var code=fs.readFileSync(__dirname+`/${name}.js`,'utf-8')
    var result = UglifyJS.minify(code,{mangle:false})
    if(result.error) throw `${name} ${result.error}`
    if(result.code.length<4096){
        console.log(`CloudWatch:${Name(name)}`, chalk.green(`${result.code.length}/4096`))
    }else{
        console.log(`CloudWatch:${Name(name)}`, chalk.red(`${result.code.length}/4096`))
    }
    return {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":result.code
        },
        "Handler": "index.handler",
        "MemorySize": "1024",
        Layers:[{"Ref":"LambdaUtilLayer"}],
        "Role": {"Fn::GetAtt": ["CloudWatchLambdaRole","Arn"]},
        "Runtime": "nodejs8.10",
        "Environment":{
            "Variables":{
                "INSTANCE":{"Fn::GetAtt":["SageMakerNotebookInstance","NotebookInstanceName"]},
                "IDLETIME":{"Ref":"IdleShutdown"},
                "STACKNAME":{"Ref":"AWS::StackName"}
            }
        },
        "TracingConfig":{
            "Mode":"Active"
        },
        "Timeout": 60,
        "Tags":[{
            Key:"Type",
            Value:"CloudWatch"
        }]
      }
    }
}
function Name(file){
    return file.replace('/','')
}
function permission(name){
    return _.fromPairs(["CheckIdle"].map(x=>{
        return [`${x}Permission${name}`,{
          "Type": "AWS::Lambda::Permission",
          "Condition":"YesIdleCheck",
          "Properties": {
            "Action": "lambda:InvokeFunction",
            "FunctionName":{"Fn::GetAtt":[`CloudWatch${name}Lambda`,"Arn"]},
            "Principal": "events.amazonaws.com",
            "SourceArn":{"Fn::GetAtt":[x,"Arn"]}
          }
        }]
        })
    )
}



