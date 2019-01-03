var aws=require('aws-sdk')
var _=require('lodash')
aws.config.region=process.env.AWS_REGION

var iam=new aws.IAM()

module.exports=function(){    
    return new Promise(function(res,rej){
        var out=[]

        function next(token){
            iam.listRoles({
                Marker:token
            }).promise()
            .then(result=>{
                result.Roles
                    .filter(filterRoles)
                    .map(x=>{return{
                        text:x.RoleName,
                        value:x.Arn,
                        Description:x.Description,
                        href:`https://console.aws.amazon.com/iam/home?region=${process.env.AWS_REGION}#/roles/$${x.RoleName}`
                    }})
                    .forEach(x=>out.push(x))
                if(result.IsTruncated){
                    next(result.Marker)
                }else{
                    res(out)
                }
            })
            .catch(rej)
        }
        next()
    })
}

function filterRoles(result){
    var doc=JSON.parse(
        decodeURIComponent(result.AssumeRolePolicyDocument)
        )
    return doc.Statement
        .filter(x=>x.Principal.Service==="sagemaker.amazonaws.com")
        .length
}

