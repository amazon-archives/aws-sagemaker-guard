var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var ssm=new aws.SSM()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    params.AssociationName=event.LogicalResourceId
    delete params.ServiceToken

    if(event.RequestType!=="Delete"){
        ssm.createAssociation(params).promise()
        .then(x=>{
            console.log(x)
            response.send(event, context, response.SUCCESS,x.AssociationDescription,x.AssociationDescription.AssociationId)
        })
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
    }else {
        ssm.deleteAssociation({
            AssociationId:event.PhysicalResourceId,
            InstanceId:params.InstanceId,
            Name:params.Name
        }).promise()
        .then(()=>response.send(event, context, response.SUCCESS))
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.SUCCESS)
        })
    }
}

