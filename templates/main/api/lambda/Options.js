var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    
    callback(null,{
        statusCode:200,
        headers:{
            Allow:"OPTIONS, GET, PUT, DELETE"
        }
    }) 
}

