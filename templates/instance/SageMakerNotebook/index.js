var fs=require('fs')
var Promise=require('bluebird')
var _=require('lodash')
var handlebars = require('handlebars')
var params=_.keys(require('../params')).map(x=>`${x}=\${${x}}`)

params.push("StackName=${AWS::StackName}")
params=params.join(',')

module.exports=Object.assign({
    "SageMakerNotebookInstance":{
        "Type": "AWS::SageMaker::NotebookInstance",
        "Properties": {
            InstanceType:{"Ref":"InstanceType"},
            NotebookInstanceName:{"Ref":"AWS::StackName"},
            RoleArn:{"Ref":"RoleArn"},
            LifecycleConfigName:{"Fn::GetAtt":["SageMakerNotebookLifecycle","NotebookInstanceLifecycleConfigName"]},
            SecurityGroupIds:[{"Ref":"SecurityGroupId"}],
            SubnetId:{"Ref":"SubnetId"},
            KmsKeyId:{"Fn::If":[
                "IfKmsKeyId",
                {"Ref":"KmsKeyId"},
                {"Ref":"AWS::NoValue"}
            ]},
            DirectInternetAccess:{"Fn::If":[
                "IfDisableDirectInternet",
                {"Ref":"DirectInternetAccess"},
                {"Ref":"AWS::NoValue"}
            ]}
        }
    },
    "SageMakerNotebookLifecycle":{
        "Type" : "AWS::SageMaker::NotebookInstanceLifecycleConfig",
        "Properties" : {
            OnCreate:[{
                Content:{"Fn::Base64":{
                    "Fn::Sub":handlebars.compile(fs.readFileSync(`${__dirname}/scripts/OnCreate.sh`,"utf-8"))({
                        params:params            
                    })
                }}
            }],
            OnStart:[{
                Content:{"Fn::Base64":{
                    "Fn::Sub":handlebars.compile(fs.readFileSync(`${__dirname}/scripts/OnStart.sh`,"utf-8"))({
                        params:params
                    })
                }}
            }]
        }
    },
    "SSMActivation":{
        "Type": "Custom::SSMActivation",
        "Properties":{
            "ServiceToken": { "Fn::GetAtt" : ["SSMActivationLambda", "Arn"] },
            "IamRole":{"Ref":"SSMRole"},
            "DefaultInstanceName":{"Ref":"AWS::StackName"},
            "RegistrationLimit":1
        }
    },
    "WaitConditionData":{
        "Type": "Custom::WaitDataParse",
        "Properties":{
            "ServiceToken": { "Fn::GetAtt" : ["WaitDataParseLambda", "Arn"] },
            "Data":{"Fn::GetAtt":["WaitCondition","Data"]}
        }
    },
    "SSMRole":{
      "Type": "AWS::IAM::Role",
      "Properties":{
            "AssumeRolePolicyDocument": {
              "Version": "2012-10-17",
              "Statement": [
                {
                  "Effect": "Allow",
                  "Principal": {
                    "Service": "ssm.amazonaws.com"
                  },
                  "Action": "sts:AssumeRole"
                }
              ]
            },
            "Path": "/",
            "ManagedPolicyArns":[
                "arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforSSM"
            ]
          }
    },
    "WaitHandle":{
        "Type" : "AWS::CloudFormation::WaitConditionHandle",
        "Properties" : {}
    },
    "WaitCondition" : {
       "Type" : "AWS::CloudFormation::WaitCondition",
       "Properties" : {
          "Handle"  : { "Ref" : "WaitHandle" },
          "Timeout" : JSON.stringify(60*15),
          "Count"   : "1"
       }
    },
    "NoteBookPolicy": {
      "Type": "AWS::IAM::ManagedPolicy",
      "Properties": {
        "PolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": [   
                "ssm:SendCommand"
              ],
              "Resource": [
                /*{"Fn::Sub":"arn:aws:ssm:*:*:document/${OnStartDocument}"},
                {"Fn::Sub":"arn:aws:ssm:*:*:document/${OnCreateDocument}"},
                {"Fn::Sub":"arn:aws:ssm:*:*:managed-instance/${WaitConditionData.id}"},*/
                "*"
              ],
            }
          ]
        },
        "Roles":[{"Ref":"RoleName"},{"Ref":"SSMRole"}]
      }
    }
},require('./ssm'))
