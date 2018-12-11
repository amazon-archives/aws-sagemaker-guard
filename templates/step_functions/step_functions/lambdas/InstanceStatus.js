var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var crypto=require('crypto')
var cf=new aws.CloudFormation()
var cd=new aws.CloudDirectory()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
   
    cf.describeStacks({
        StackName:event.Attributes.StackName
    }).promise()
    .then(result=>{
        callback(null,result.Stacks[0])
    })
    .catch(x=>{
        console.log(x)
        callback(new Error(x))
    })
}
