var aws=require('aws-sdk')
var _=require('lodash')
aws.config.region=process.env.AWS_REGION
var s3=new aws.S3()
var ssm=new aws.SSM()
var memoize = require("memoizee");

module.exports=memoize(function(){
    return s3.getObject({
        Bucket:process.env.ASSETBUCKET,
        Key:`${process.env.ASSETPREFIX}/instance.json`
    }).promise()
    .then(result=>{
        var template=JSON.parse(result.Body.toString())
        var out=_.keys(_.omit(template.Parameters,["OnCreateDocument","OnTerminateDocument","OnStartDocument"]))
        out.push("StackName")
        out.push("InstanceId")
        out.push("SSMRoleArn")
        return out
    })
},{
    promise:true,
    maxAge:5000
})


