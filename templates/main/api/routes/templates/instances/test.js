var aws=require('aws-sdk')
var _=require('lodash')
aws.config.region="us-east-1"
var ssm=new aws.SSM()

ssm.listDocuments({
    DocumentFilterList:[{
        key:"PlatformTypes",
        value:"Linux"
    },
    {
        key:"DocumentType",
        value:"Command"
    }]
}).promise().then(console.log)

