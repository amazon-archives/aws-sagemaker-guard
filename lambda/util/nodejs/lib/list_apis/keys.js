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
                    .forEach(x=>out.push(x))

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

