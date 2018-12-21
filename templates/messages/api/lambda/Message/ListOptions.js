var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cognito=new aws.CognitoIdentityServiceProvider()
var send=require('request').send
var m=require('messages')
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    if(m.isAdmin(event)){
        callback(null,{
            statusCode:200,
            headers:{
                Allow:"OPTIONS, GET"
            }
        })
    } else{
        callback(null,{
            statusCode:200,
            headers:{
                Allow:"OPTIONS, GET, PUT"
            }
        })
    }
}
function isAdmin(event){
    var groups=event.requestContext.authorizer.claims["cognito:groups"]
    if(typeof groups ==="string"){
        return groups==="admins"
    }else{
        return groups.includes("admins")
    }
}
