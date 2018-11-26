var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var cognito=new aws.CognitoIdentityServiceProvider()
var crypto=require('crypto')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    if(event.RequestType==="Create"){
        var name=generate()
        cognito.createUserPoolDomain({
            Domain:name,
            UserPoolId:params.UserPool
        }).promise()    
        .then(x=>response.send(event, context, response.SUCCESS,{
             
        },name))
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
    }else if(event.RequestType==="Delete"){
        var name=event.PhysicalResourceId
        cognito.deleteUserPoolDomain({
            Domain:name,
            UserPoolId:params.UserPool
        }).promise()
        .then(x=>response.send(event, context, response.SUCCESS,{},name))
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
    }else{
        response.send(event, context, response.SUCCESS)
    }
}
function generate(){
    return crypto.randomBytes(16)
        .toString('base64')
        .replace(/=|\/|\+/g,'')
        .toLowerCase()
}
