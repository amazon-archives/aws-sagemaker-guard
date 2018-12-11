module.exports={
    "InstanceInventory":{
        "Type": "AWS::SSM::Association",
        "Properties":{
            Name:{"Ref":"InventoryDocument"},
            Targets:[{
                Key:"tag:Stack",
                Values:[{"Ref":"StackName"}]
            }],
            ScheduleExpression:"cron(0 0 0/12 ? * * *)",
            Parameters:{
                "files":[JSON.stringify([{
                    Path:"/home/ec2-user/SageMaker",
                    Pattern:["*.ipynb"],
                    Recursive:true
                }])]
            },
            OutputLocation:{
                S3Location:{
                    OutputS3BucketName:{"Ref":"LogsBucket"},
                    OutputS3KeyPrefix:"ssm/logs/inventory"
                }
            }
        }
    },
    "DataSync":{
        "Type" : "AWS::SSM::ResourceDataSync",
        "Properties" : {
            BucketName:{"Ref":"LogsBucket"},
            BucketPrefix:"ssm/inventory",
            SyncFormat:"JsonSerDe",
            BucketRegion:{"Ref":"AWS::Region"},
            SyncName:{"Ref":"StackName"}
        }
    },
    "InventoryDocument":{
        "Type" : "AWS::SSM::Document",
        "Properties" : {
            Content:require('./inventory-doc'),
            DocumentType:"Command"
        }
    },
    "InstallDocument":{
        "Type" : "AWS::SSM::Document",
        "Properties" : {
            Content:require('./install-doc'),
            DocumentType:"Command"
        }
    },
    "UninstallDocument":{
        "Type" : "AWS::SSM::Document",
        "Properties" : {
            Content:require('./uninstall-doc'),
            DocumentType:"Command"
        }
    }
}
