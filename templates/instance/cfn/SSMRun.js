var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var ssm=new aws.SSM()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken

    if(event.RequestType==="Create"){
        ssm.sendCommand(params).promise()
        .then(x=>{
            console.log(x)
            response.send(event, context, response.SUCCESS)
        })
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
    }else{
        response.send(event, context, response.SUCCESS)
    }
}

