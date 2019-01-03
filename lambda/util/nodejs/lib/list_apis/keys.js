var aws=require('aws-sdk')
var _=require('lodash')
aws.config.region=process.env.AWS_REGION
var kms=new aws.KMS()

module.exports=function(){
    return new Promise(function(res,rej){
        var out=[]

        function next(token){
            kms.listKeys({
                Marker:token,
                Limit:1000,
            }).promise()
            .then(result=>{
                result.Keys
                    .forEach(x=>out.push({
                        text:x.KeyId,
                        value:x.KeyId,
                        href:`https://console.aws.amazon.com/kms/home?region=${process.env.AWS_REGION}#/kms/keys/${x.KeyId}/`
                    }))

                if(result.Truncated){
                    next(result.NextMarker)
                }else{
                    res(out)
                }
            })
            .catch(rej)
        }
        next()
    })
} 

