var axios=require('axios')
var jwt=require('jsonwebtoken')
var jwkToPem = require('jwk-to-pem');
var authenticate=require('./lib/authenticate')
var authorize=require('./lib/authorize')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var token=event.headers.Authorization
    var userpool=event.stageVariables.UserPool

    authenticate(token,userpool)
    .then(result=>{
        console.log(result)
        return authorize(
            result.payload["cognito:username"],
            event
        )
    })
    .then(id=>{
		var headers = event.headers;
		var queryStringParameters = event.queryStringParameters;
		var pathParameters = event.pathParameters;
		var stageVariables = event.stageVariables;
		var requestContext = event.requestContext;

		var tmp = event.methodArn.split(':');
    	var awsAccountId = tmp[4];
		var region = tmp[3];

		var apiGatewayArnTmp = tmp[5].split('/');
		var restApiId = apiGatewayArnTmp[0];
		var stage = apiGatewayArnTmp[1];
	    var out={
            principalId:id,
            context:{
                InstanceName:event.pathParameters.id
            },
            policyDocument:{
                Version:'2012-10-17',
                Statement:[{
                    Action:"execute-api:Invoke",
                    Effect:"Allow",
                    Resource:event.methodArn,
                }]
            }
        }	
        console.log(out)
        callback(null,out)
    })
    .catch(error=>{
        console.log(error)
        callback("unAuthorized")
    })
}
