var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.maxRetries=10
aws.config.region=process.env.AWS_REGION
var api=new aws.APIGateway()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken
    if(event.RequestType==="Create" || event.RequestType==="Update"){
        var value=params.value
    }else{
        var value=null
    }
    api.updateRestApi({
        restApiId:params.restApiId,
        patchOperations:[{
            op:"replace",
            path:"/minimumCompressionSize",
            value:value
        }]
    }).promise()
    .then(x=>response.send(event, context, response.SUCCESS))
    .catch(error=>{
        console.log(error)
        response.send(event, context, response.FAILED)
    })
}
    
