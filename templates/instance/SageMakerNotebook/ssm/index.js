var _=require('lodash')

var params=_.fromPairs(_.keys(_.omit(require('../../../instance/params'),["OnCreateDeleteDocument","OnStartStopDocument"]))
        .map(x=>[x,[{"Ref":x}]]))

params.InstanceId=[{"Fn::GetAtt":["WaitConditionData","id"]}]
params.StackName=[{"Ref":"AWS::StackName"}]
params.RoleArn=[{"Fn::GetAtt":["Role","Arn"]}]
params.SSMRoleArn=[{"Fn::GetAtt":["SSMRole","Arn"]}]

module.exports={
    "RunCreateDeleteDocument":{
        "Type": "Custom::RunDocument",
        "Condition":"CreateDocument", 
        "Properties":{
            "ServiceToken": { "Fn::GetAtt" : ["SSMRunLambda", "Arn"] },
            "State":{"Ref":"SageMakerNotebookInstanceState"},
            "config":{
                "DocumentName":{"Ref":"OnCreateDeleteDocument"},
                Parameters:params,
                InstanceIds:[{"Fn::GetAtt":["WaitConditionData","id"]}],
                OutputS3BucketName:{"Ref":"LogsBucket"},
                OutputS3KeyPrefix:{"Fn::Sub":"${AWS::StackName}/Start/"},
                OutputS3Region:{"Ref":"AWS::Region"}
            }
        }
    },
    "RunStartStopDocument":{
        "Type": "Custom::Lifecycle",
        "Condition":"TurnOnDocument", 
        "DependsOn":["SageMakerNotebookInstance"],
        "Properties":{
            "ServiceToken": { "Fn::GetAtt" : ["SSMRunLambda", "Arn"] },
            "State":{"Ref":"SageMakerNotebookInstanceState"},
            "config":{
                "DocumentName":{"Ref":"OnStartStopDocument"},
                Parameters:params,
                InstanceIds:[{"Fn::GetAtt":["WaitConditionData","id"]}],
                OutputS3BucketName:{"Ref":"LogsBucket"},
                OutputS3KeyPrefix:{"Fn::Sub":"${AWS::StackName}/Start/"},
                OutputS3Region:{"Ref":"AWS::Region"}
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
