var fs=require('fs')
var _=require('lodash')

var commands=_.fromPairs(fs.readdirSync(`${__dirname}/commands`)
    .map(x=>x.match(/(.*)\.js/))
    .filter(x=>x)
    .map(x=>x[1])
    .map(x=>[`${x}CommandDocument`,command(x)]))

var automations=_.fromPairs(fs.readdirSync(`${__dirname}/automation`)
    .map(x=>x.match(/(.*)\.js/))
    .filter(x=>x)
    .map(x=>x[1])
    .map(x=>[`${x}AutomationDocument`,automation(x)]))

var Tags=[{
    Key:"StackName",
    Value:{"Ref":"AWS::StackName"}
}]


module.exports=Object.assign(commands,automations,{
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
            Content:require('./inventory'),
            Tags,
            DocumentType:"Command"
        }
    }
})
function automation(name){
    return {
        "Type" : "AWS::SSM::Document",
        "Properties" : {
            Content:require(`./automation/${name}`),
            Tags,
            DocumentType:"Automation"
        }
    }
}
function command(name){
    return {
        "Type" : "AWS::SSM::Document",
        "Properties" : {
            Content:require(`./commands/${name}`),
            Tags,
            DocumentType:"Command"
        }
    }
}


