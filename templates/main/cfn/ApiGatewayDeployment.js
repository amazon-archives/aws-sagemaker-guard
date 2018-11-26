var aws=require('aws-sdk')
aws.config.maxRetries=10
aws.config.region=process.env.AWS_REGION
var api=new aws.APIGateway()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken
    if(event.RequestType==="Create"){
        delete params.buildDate
        delete params.stage

        run(()=>api.createDeployment(params).promise())
        .then(result=>send("SUCCESS",{},result.id))
        .catch(error)
    }else if(event.RequestType==="Update"){
        var stage=params.stage
        delete params.buildDate
        delete params.stage

        new Promise(function(res,rej){
            run(()=>api.createDeployment(params).promise())
            .then(result=>setTimeout(()=>res(result.id),2000))
            .catch(rej)
        })
        .then(id=>run(()=>api.updateStage({
                restApiId:params.restApiId,
                stageName:stage,
                patchOperations:[{
                    op:"replace",
                    path:"/deploymentId",
                    value:id
                }]
            }).promise()
            .then(()=>send("SUCCESS",{},id))
        ))
        .catch(error)
    }else{
        run(()=>api.deleteDeployment({
            deploymentId:event.PhysicalResourceId,
            restApiId:params.restApiId
        }).promise())
        .then(id=>send("SUCCESS",{},event.PhysicalResourceId))
        .catch(error)
    }

    function error(e){
        console.log(e)
        send("FAILED",{},event.id,e.toString())
    }
    function send(responseStatus, responseData, physicalResourceId,reason) {
        var responseBody = JSON.stringify({
            Status: responseStatus,
            Reason:reason,
            PhysicalResourceId: physicalResourceId || context.logStreamName,
            StackId: event.StackId,
            RequestId: event.RequestId,
            LogicalResourceId: event.LogicalResourceId,
            Data: responseData
        });
     
        console.log("Response body:\n", responseBody);
     
        var https = require("https");
        var url = require("url");
     
        var parsedUrl = url.parse(event.ResponseURL);
        var options = {
            hostname: parsedUrl.hostname,
            port: 443,
            path: parsedUrl.path,
            method: "PUT",
            headers: {
                "content-type": "",
                "content-length": responseBody.length
            }
        };
     
        var request = https.request(options, function(response) {
            console.log("Status code: " + response.statusCode);
            console.log("Status message: " + response.statusMessage);
            context.done();
        });
     
        request.on("error", function(error) {
            console.log("send(..) failed executing https.request(..): " + error);
            context.done();
        });
     
        request.write(responseBody);
        request.end();
    }
}


function run(fnc){
    return new Promise(function(res,rej){
        console.log("starting")
        function next(count){
            console.log("tries left:"+count)
            if(count>0){
                fnc()
                .then(res)
                .catch(x=>{
                    if(x.statusCode===429){
                        console.log("retry in "+x.retryDelay)
                        setTimeout(()=>next(--count),x.retryDelay*1000)
                    }else{
                        rej(x)
                    }
                })
            }else{
                rej("timeout")
            }
        }
        next(10)
    })
}
