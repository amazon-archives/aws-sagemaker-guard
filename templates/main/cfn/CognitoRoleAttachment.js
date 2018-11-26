var response = require('cfn-response')
var https = require("https");
var url = require("url");
var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cognito=new aws.CognitoIdentity()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken
    
    new Promise(function(res,rej){
        if(event.RequestType==="Create" || event.RequestType==="Update"){
            var RoleMappings={}
            params.RoleMappings.map(function(x){
                var id="cognito-idp.us-east-1.amazonaws.com/"+x.UserPool+':'+x.ClientId
                delete x.ClientId
                delete x.UserPool
                RoleMappings[id]=x
            })

            cognito.getIdentityPoolRoles({
                IdentityPoolId:params.IdentityPoolId
            }).promise()
            .then(function(result){
                result.Roles=Object.assign(result.Roles || {},params.Roles)
                result.RoleMappings=Object.assign(result.RoleMappings || {},RoleMappings)
                console.log(result)

                return cognito.setIdentityPoolRoles(result).promise()
            })
            .then(function(result){
                send("SUCCESS",result,result.ObjectIdentifier)
                res()
            })
        }else if(event.RequestType==="Delete"){
            send("SUCCESS",{},event.PhysicalResourceId)
            res()
        }
    })
    .catch(function(e){
        console.log(e)
        send("FAILED",{},event.PhysicalResourceId,e.toString())
    })

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
