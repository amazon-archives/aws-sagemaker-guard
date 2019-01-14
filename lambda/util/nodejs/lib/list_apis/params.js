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
        console.log(template.Parameters)
        var out=_.keys(_.omit(template.Parameters,["OnCreateDeleteDocument","OnStartStopDocument"]))
        out.push("StackName")
        out.push("InstanceId")
        out.push("SSMRoleArn")
        out.push("Event")
        console.log(out)
        return out
    })
},{
    promise:true,
    maxAge:5000
})


