var aws=require('aws-sdk')
var _=require('lodash')
aws.config.region=process.env.AWS_REGION
var glue=new aws.Glue()

module.exports=function(){
    return new Promise(function(res,rej){
        var out=[]

        function next(token){
            glue.getDevEndpoints({
                NextToken:token
            }).promise()
            .then(result=>{
                result.DevEndpoints
                    .forEach(x=>out.push({
                        text:x.EndpointName,
                        value:x.EndpointName,
                        description:`Nodes:${x.NumberOfNodes}`,
                        href:`https://console.aws.amazon.com/glue/home?region=${process.env.AWS_REGION}#devEndpoint:name=${x.EndpointName}`
                    }))

                if(result.NextToken){
                    next(result.NextToken)
                }else{
                    res(out)
                }
            })
            .catch(rej)
        }
        next()
    })
}
