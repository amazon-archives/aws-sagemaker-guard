module.exports={
    "InitDocument":{
        "Type" : "AWS::SSM::Document",
        "Properties" : {
            Content:require('./init'),
            DocumentType:"Command"
        }
    },
    "RunInitDocument":{
        "Type": "Custom::SSMTags",
        "DependsOn":["InstanceSSMTags","NoteBookPolicy"],
        "Properties":{
            "ServiceToken": { "Fn::GetAtt" : ["SSMRunLambda", "Arn"] },
            "DocumentName":{"Ref":"InitDocument"},
            InstanceIds:[{"Fn::GetAtt":["WaitConditionData","id"]}]
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
