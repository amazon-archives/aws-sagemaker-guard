var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var sagemaker=new aws.SageMaker()
var lambda=new aws.Lambda()
var cf=new aws.CloudFormation()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    
    stackname=event.object.StackName
    cf.updateTerminationProtection({
        StackName:stackname,
        EnableTerminationProtection:false
    }).promise()
    .then(()=>cf.deleteStack({
        StackName:stackname
    }).promise())
    .then(()=>callback(null,event))
}

