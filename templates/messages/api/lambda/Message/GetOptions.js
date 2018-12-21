var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cognito=new aws.CognitoIdentityServiceProvider()
var send=require('request').send
var lambda=new aws.Lambda()
var m=require('messages')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    if(m.isAdmin(event)){
        callback(null,{
            statusCode:200,
            headers:{
                Allow:"OPTIONS, GET, PUT"
            }
        })
    } else{
        callback(null,{
            statusCode:200,
            headers:{
                Allow:"OPTIONS, GET, PUT, DELETE"
            }
        })
    }
}

