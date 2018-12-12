var response = require('cfn-response')
var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var es = new aws.ES();

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken

    if(event.RequestType!=="Delete"){
        var name=params.endpoint.match(/search-(.*)-.*\..*\.es/)[1]
        console.log(name)
        es.describeElasticsearchDomain({
            DomainName:name
        }).promise()
        .then(x=>response.send(event, context, response.SUCCESS,x.DomainStatus,name))
        .catch(x=>{
            console.log(x)
            response.send(event, context, response.FAILED)
        })
    }else{
        response.send(event, context, response.SUCCESS)
    }
}

