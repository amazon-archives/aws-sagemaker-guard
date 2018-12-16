var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()
var step=new aws.StepFunctions()

exports.validate=result=>{
    console.log(JSON.stringify(result,null,2))
    if(result.FunctionError){
        throw JSON.parse(JSON.parse(result.Payload).errorMessage)
    }else{
        return JSON.parse(result.Payload)
    }
}
