var fs=require('fs')
var _=require('lodash')
var UglifyJS = require("uglify-es");
var chalk=require('chalk')

var lambdas=_.fromPairs(fs.readdirSync(__dirname)
    .filter(x=>x!=='index.js')
    .filter(x=>x!=='README.md')
    .map(x=>x.match(/(.*)\.js/)[1])
    .map(x=>[`StepFunction${x}`,lambda(x,'StepFunction')]))

module.exports=Object.assign(lambdas,{
        "StepLambdaRole":{
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
                "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess",
                "arn:aws:iam::aws:policy/AmazonCloudDirectoryFullAccess",
                "arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess",
                "arn:aws:iam::aws:policy/AWSStepFunctionsFullAccess"
            ],
            "Policies":[{
                "PolicyName":"Access",
                "PolicyDocument": {
                  "Version": "2012-10-17",
                  "Statement": [{
                        Effect:"Allow",
                        Action:[
                            "cloudformation:*",
                            "iam:PassRole"
                        ],
                        "Resource":"*"
                  },{
                        Effect:"Allow",
                        Action:[
                            "s3:*"
                        ],
                        "Resource":{"Fn::Sub":"arn:aws:s3:::${AssetBucket}/*"}
                  }]
                }
            }]
          }
        }
    })

function lambda(name,type){
    var code=fs.readFileSync(__dirname+`/${name}.js`,'utf-8')
    var result = UglifyJS.minify(code,{mangle:false})
    if(result.error) throw `${name} ${result.error}`
    if(result.code.length<4096){
        console.log(`${type}:${Name(name)}`, chalk.green(`${result.code.length}/4096`))
    }else{
        console.log(`${type}:${Name(name)}`, chalk.red(`${result.code.length}/4096`))
    }
    return {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":result.code
        },
        "Handler": "index.handler",
        "MemorySize": "1024",
        "Role": {"Fn::GetAtt": ["StepLambdaRole","Arn"]},
        "Runtime": "nodejs6.10",
        "Environment":{
            "Variables":{
                DIRECTORY:{"Ref":"Directory"},
                SCHEMA:{"Ref":"AppliedSchemaArn"},
                ASSETBUCKET:{"Ref":"AssetBucket"},
                ASSETPREFIX:{"Ref":"AssetPrefix"},
                STACKNAME:{"Ref":"StackName"},
                STACKCREATEROLE:{"Fn::GetAtt":["StackCreateRole","Arn"]},
                SUBNET:{"Ref":"Subnet"},
                SECURITYGROUP:{"Ref":"SecurityGroup"},
                EFS:{"Ref":"EFS"},
                SSMLOGGROUP:{"Ref":"SSMLogGroup"},
                LOGSBUCKET:{"Ref":"LogsBucket"}
            }
        },
        "TracingConfig":{
            "Mode":"Active"
        },
        "Timeout": 60,
        "Tags":[{
            Key:"Type",
            Value:type
        }]
      }
    }
}

function Name(file){
    return file.replace('/','')
}

