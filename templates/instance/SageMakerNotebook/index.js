var fs=require('fs')
var Promise=require('bluebird')
var _=require('lodash')
var handlebars = require('handlebars')
var params=_.keys(require('../params')).map(x=>`${x}=\${${x}}`)

params.push("StackName=${AWS::StackName}")
params=params.join(',')

module.exports=Object.assign({
    "SageMakerNotebookInstance":{
        "Type": "Custom::NotebookInstance",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["NotebookLambda", "Arn"] },
            VolumeSizeInGB:{"Ref":"VolumeSize"},
            InstanceType:{"Ref":"InstanceType"},
            NotebookInstanceName:{"Ref":"AWS::StackName"},
            RoleArn:{"Fn::GetAtt":["Role","Arn"]},
            LifecycleConfigName:{"Fn::GetAtt":["SageMakerNotebookLifecycle","NotebookInstanceLifecycleConfigName"]},
            SecurityGroupIds:[{"Ref":"SecurityGroupId"}],
            SubnetId:{"Ref":"SubnetId"},
            DefaultCodeRepository:{"Fn::If":[
                "IfCodeRepository",
                {"Ref":"CodeRepository"},
                {"Ref":"AWS::NoValue"}
            ]},
            AcceleratorTypes:{"Fn::If":[
                "IfAcceleratorType",
                [{"Ref":"AcceleratorType"}],
                {"Ref":"AWS::NoValue"}
            ]},
            KmsKeyId:{"Fn::If":[
                "IfCreateKey",
                {"Ref":"KMSKey"},
                {"Fn::If":[
                    "IfKmsKeyId",
                    {"Ref":"KmsKeyId"},
                    {"Ref":"AWS::NoValue"}
                ]}
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
            ],
            "Policies":[{
                "PolicyName":"Access2",
                "PolicyDocument": {
                  "Version": "2012-10-17",
                  "Statement": [{
                        Effect:"Allow",
                        Action:[
                            "cloudformation:DescribeStacks"
                        ],
                        "Resource":"*"
                  }]
                }
            },{"Fn::If":["IfGlueDevEndpoint",
                {
                    "PolicyName":"Access",
                    "PolicyDocument": {
                      "Version": "2012-10-17",
                      "Statement": [{
                            Effect:"Allow",
                            Action:[
                                "glue:GetDevEndpoint",
                                "glue:UpdateDevEndpoint"
                            ],
                            "Resource":{"Fn::Sub":"arn:aws:glue:${AWS::Region}:${AWS::AccountId}:devEndpoint/${GlueDevEndpoint}"}
                      }]
                    }
                },
                {"Ref":"AWS::NoValue"}]}
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
    "KMSKey":{
        "Type" : "AWS::KMS::Key",
        "Condition":"IfCreateKey", 
        "Properties":{
            Description:{"Fn::Sub":"Key created for notebook instance ${AWS::StackName}"},
            Enabled:true,
            PendingWindowInDays:7,
            Tags:[{
                Value:{"Ref":"AWS::StackName"},
                Key:"SageGuard"
            }],
            KeyPolicy:{
              "Version": "2012-10-17",
              "Statement": [{
                    "Sid": "Enable IAM User Permissions",
                    "Effect": "Allow",
                    "Principal": {
                        "AWS": {"Fn::Sub":"arn:aws:iam::${AWS::AccountId}:root"}
                    },
                    "Action": "kms:*",
                    "Resource": "*"
                }]
            }
        }
    }
},require('./ssm'))
