var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var cognito=new aws.CognitoIdentityServiceProvider()
var crypto=require('crypto')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken
    params.AdminCreateUserConfig.AllowAdminCreateUserOnly=params.AdminCreateUserConfig.AllowAdminCreateUserOnly==="true"

    if(event.RequestType!=="Delete"){
        cognito.updateUserPool(params).promise()    
        .then(x=>response.send(event, context, response.SUCCESS,{
        }))
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
    }else{
        response.send(event, context, response.SUCCESS)
    }
}

