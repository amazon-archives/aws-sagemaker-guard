module.exports={
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
