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
                        name:x.EndpointName,
                        nodes:x.NumberOfNodes,
                        vpc:x.VpcId
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
