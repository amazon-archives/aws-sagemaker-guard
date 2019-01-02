var _=require('lodash')

var params=_.fromPairs(_.keys(_.omit(require('../../../instance/params'),["OnCreateDocument","OnTerminateDocument","OnStartDocument"]))
        .map(x=>[x,[{"Ref":x}]]))

params.InstanceId=[{"Fn::GetAtt":["WaitConditionData","id"]}]
params.StackName=[{"Ref":"AWS::StackName"}]
params.RoleArn=[{"Fn::GetAtt":["Role","Arn"]}]
params.SSMRoleArn=[{"Fn::GetAtt":["SSMRole","Arn"]}]

module.exports={
    "RunStartDocument":{
        "Type": "Custom::RunDocument",
        "Condition":"IfOnStartDocument", 
        "DependsOn":["SageMakerNotebookInstance"],
        "Properties":{
            "ServiceToken": { "Fn::GetAtt" : ["SSMRunLambda", "Arn"] },
            "event":"Create",
            "config":{
                "DocumentName":{"Ref":"OnStartDocument"},
                Parameters:params,
                InstanceIds:[{"Fn::GetAtt":["WaitConditionData","id"]}],
                OutputS3BucketName:{"Ref":"LogsBucket"},
                OutputS3KeyPrefix:{"Fn::Sub":"${AWS::StackName}/Start/"},
                OutputS3Region:{"Ref":"AWS::Region"}
            }
        }
    },
    "RunLifeCycleDocument":{
        "Type": "Custom::Lifecycle",
        "DependsOn":["SageMakerNotebookInstance"],
        "Properties":{
            "ServiceToken": { "Fn::GetAtt" : ["LifecycleLambda", "Arn"] },
            "event":"Update",
            "state":{"Ref":"State"},
            "config":{
                "DocumentName":{"Fn::If":[
                    "TurnOn",
                    {"Ref":"OnStartDocument"},
                    {"Ref":"OnStopDocument"}
                ]},
                Parameters:params,
                InstanceIds:[{"Fn::GetAtt":["WaitConditionData","id"]}],
                OutputS3BucketName:{"Ref":"LogsBucket"},
                OutputS3KeyPrefix:{"Fn::Sub":"${AWS::StackName}/Start/"},
                OutputS3Region:{"Ref":"AWS::Region"}

            }
        }
    },
    "RunLifeCycleDocumentCleanUp":{
        "Type": "Custom::Lifecycle",
        "Condition":"IfOnStopDocument",
        "DependsOn":["SageMakerNotebookInstance"],
        "Properties":{
            "ServiceToken": { "Fn::GetAtt" : ["LifecycleLambda", "Arn"] },
            "event":"Delete",
            "state":"OFF",
            "config":{
                "DocumentName":{"Ref":"OnStopDocument"},
                Parameters:params,
                InstanceIds:[{"Fn::GetAtt":["WaitConditionData","id"]}],
                OutputS3BucketName:{"Ref":"LogsBucket"},
                OutputS3KeyPrefix:{"Fn::Sub":"${AWS::StackName}/Start/"},
                OutputS3Region:{"Ref":"AWS::Region"}

            }
        }
    },
    "RunTerminateDocument":{
        "Type": "Custom::RunDocument",
        "Condition":"IfOnTerminateDocument", 
        "DependsOn":["SageMakerNotebookInstance"],
        "Properties":{
            "ServiceToken": { "Fn::GetAtt" : ["SSMRunLambda", "Arn"] },
            "event":"Delete",
            "config":{
                "DocumentName":{"Ref":"OnTerminateDocument"},
                Mode:"Auto",
                Parameters:params,
                OutputS3BucketName:{"Ref":"LogsBucket"},
                OutputS3KeyPrefix:{"Fn::Sub":"${AWS::StackName}/Start/"},
                OutputS3Region:{"Ref":"AWS::Region"}
            }
        }
    },
    "RunCreateDocument":{
        "Type": "Custom::RunDocument",
        "Condition":"IfOnCreateDocument", 
        "DependsOn":["SageMakerNotebookInstance"],
        "Properties":{
            "ServiceToken": { "Fn::GetAtt" : ["SSMRunLambda", "Arn"] },
            "event":"Create",
            "config":{
                "DocumentName":{"Ref":"OnCreateDocument"},
                Mode:"Auto",
                Parameters:params
            }
        }
    },
    "InstanceSSMTags":{
        "Type": "Custom::SSMTags",
        "Properties":{
            "ServiceToken": { "Fn::GetAtt" : ["SSMTagsLambda", "Arn"] },
            ResourceId:{"Fn::GetAtt":["WaitConditionData","id"]},
            ResourceType:"ManagedInstance",
            Tags:[{
                Key:"Project",
                Value:"SageGuard"
            },{
                Key:"Name",
                Value:{"Ref":"AWS::StackName"}
            },{
                Key:"Stack",
                Value:{"Ref":"ParentStack"}
            }]
        }
    }
}
