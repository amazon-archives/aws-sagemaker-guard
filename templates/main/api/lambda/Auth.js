var axios=require('axios')
var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()
var _=require('lodash')
var jose=require('node-jose')
var Promise=require('bluebird')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var token=event.headers.Authorization || event.queryStringParameters.Auth
    var userpool=event.stageVariables.UserPool

    authenticate(token,userpool)
    .then(result=>{
        console.log(result)
        return authorize(
            result["cognito:username"],
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
        console.log(JSON.stringify(out,null,2))
        callback(null,out)
    })
    .catch(error=>{
        console.log(error)
        callback("unAuthorized")
    })
}


function authenticate(token,userpool){
    var url=`https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${userpool}/.well-known/jwks.json`

    try {
        var sections=token.split('.')
        var header =JSON.parse(jose.util.base64url.decode(sections[0]));
        var kid = header.kid;
        
        return axios.get(`${url}`).then(x=>x.data.keys)
        .then(keys=>    _.fromPairs(keys.map(x=>[x.kid,x])))
        .then(keys=>    jose.JWK.asKey(keys[kid]))
        .then(result=>  jose.JWS.createVerify(result).verify(token))
        .then(result=>{
            var claims = JSON.parse(result.payload);
            var current_ts = Math.floor(new Date() / 1000);
            if (current_ts > claims.exp) {
                throw 'Token is expired';
            }
            return claims
        })
    }catch(e){
        console.log(e)
        return Promise.reject("Invalid Token:Failed to parse")
    }
}

function authorize(userId,event){
    var instanceId=event.pathParameters.id
    var ListPolicyFunction=event.stageVariables.APICloudDirectoryPolicyListLambda

    return new Promise(function(res,rej){
        next()

        function next(NextToken){
            return lambda.invoke({
                FunctionName:ListPolicyFunction,
                InvocationType:"RequestResponse",
                Payload:JSON.stringify({
                    MaxResults:30,
                    NextToken:NextToken,
                    path:`/users/${userId}`,
                    Type:"users",
                    SubType:"instances",
                    ChildrenOrParents:"children"
                })
            }).promise()
            .then(function(result){
                console.log(result)
                var data=JSON.parse(result.Payload)
                var instances=data.Links.map(x=>x.TargetObjectReference.Selector.slice(1))
                if(instances.includes(instanceId)){
                    res(userId)
                }else if(result.NextToken){
                    next(result.NextToken)
                }else{
                    rej("notAuthorized")
                }
            })
        }
    })
}
