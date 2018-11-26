var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var ssm=new aws.SSM()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken

    if(event.RequestType==="Create"){
        ssm.createActivation(params).promise()
        .then(x=>{
            console.log(x)
            response.send(event, context, response.SUCCESS,x,x.ActivationId)
        })
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
    }else if(event.RequestType==="Update"){
        response.send(event, context, response.SUCCESS,event.OldResourceProperties,event.PhysicalResourceId)
    }else{
        ssm.describeInstanceInformation({
            Filters:[{
                Key:"ActivationIds",
                Values:[event.PhysicalResourceId]
            }],
        }).promise()
        .then(x=>{
            console.log(JSON.stringify(x,null,2))
            return ssm.deregisterManagedInstance({
                InstanceId:x.InstanceInformationList[0].InstanceId
            }).promise()
        })
        .then(x=>{
            console.log(JSON.stringify(x,null,2))
            return ssm.deleteActivation({
                ActivationId:event.PhysicalResourceId
            }).promise()
        })
        .then(x=>response.send(event, context, response.SUCCESS))
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.SUCCESS)
        })
    }
}

