var aws=require('aws-sdk')
var _=require('lodash')
aws.config.region=process.env.AWS_REGION
var s3=new aws.S3()
var ssm=new aws.SSM()
var memoize = require("memoizee");

var getParams=require('./params')
module.exports=function(){
    
    var params=getParams()
    return new Promise(function(res,rej){
        var out=[]
        function next(token){
            Promise.all([ssm.listDocuments({
                NextToken:token
            }).promise()
            ,params])
            .then(results=>{
                var result=results[0].DocumentIdentifiers
                    .filter(x=>!x.Name.match(/^AWS-/))
                    .filter(x=>!x.Name.match(/^AWS/))
                    .filter(x=>!x.Name.match(/^Amazon/))
                var param=results[1]
                console.log(result)
                Promise.all(result.map(x=>ssm.describeDocument({
                        Name:x.Name
                    }).promise())
                ).then(x=>{
                    x.filter(y=>{
                        console.log(y.Document)
                        return _.xor(
                            _.get(y,"Document.Parameters",[]).map(z=>z.Name),
                            param
                        ).length===0
                    })
                    .forEach(y=>{
                        out.push(_.omit(y.Document,'Parameters'))
                    })
                    
                    if(results[0].NextToken){
                        next(results[0].NextToken)
                    }else{
                        res(out)
                    }
                })
                .catch(rej)
            })
            .catch(rej)
        }
        next()
    })
}
