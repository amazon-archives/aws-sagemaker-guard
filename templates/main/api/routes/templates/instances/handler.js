var aws=require('aws-sdk')
var _=require('lodash')
aws.config.region=process.env.AWS_REGION
var list_apis=require('list_apis')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    list_apis()
    .then(result=>callback(null,result))
    .catch(error=>{
        console.log(error)
        callback(JSON.stringify({
            type:error.statusCode===404 ? "[NotFoud]" : "[InternalServiceError]",
            status:error.statusCode,
            message:error.message,
            data:error
        }))
    })
}

