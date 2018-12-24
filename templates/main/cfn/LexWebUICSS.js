var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var s3=new aws.S3()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken
    delete params.Version
    try{
        if(event.RequestType!=="Delete"){
            var dst_bucket=params.URL.match(/https:\/\/(.*)\.s3.*/)[1]
            var src_bucket=params.Bucket
            var index=params.Index
            var css=params.CSS
            console.log({
                    Bucket:dst_bucket,
                    Key:"index.html",
                    CopySource:`/${src_bucket}/${index}`,
                    ACL:"public-read"
                })
            Promise.all([
                s3.copyObject({
                    Bucket:dst_bucket,
                    Key:"index.html",
                    CopySource:`/${src_bucket}/${index}`,
                    ACL:"public-read"
                }).promise(),
                s3.copyObject({
                    Bucket:dst_bucket,
                    Key:"custom.css",
                    CopySource:`/${src_bucket}/${css}`,
                    ACL:"public-read"
                }).promise()
            ])
            .then(console.log)
            .then(()=>response.send(event, context, response.SUCCESS))
            .catch(e=>{
                console.log(e)
                response.send(event, context, response.FAILED)
            })
        }else{
            response.send(event, context, response.SUCCESS)
        }
    }catch(e){
        console.log(e)
        response.send(event, context, response.FAILED)
    }
}   
