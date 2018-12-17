var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var _=require('lodash')
var s3=new aws.S3()
var cognito=new aws.CognitoIdentityServiceProvider()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken
    if(event.RequestType!=="Delete"){
        s3.getObject(params.ImageFile).promise()
        .then(x=>{
            console.log(x)
            return cognito.setUICustomization(
            Object.assign(
                _.omit(params,["ImageFile"]),
                {ImageFile:x.Body}
            )
            ).promise()
        })
        .then(()=>response.send(event, context, response.SUCCESS))
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
    }else{
        response.send(event, context, response.SUCCESS)
    }
}




