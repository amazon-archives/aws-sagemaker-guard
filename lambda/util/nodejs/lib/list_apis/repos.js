var aws=require('aws-sdk')
var _=require('lodash')
aws.config.region=process.env.AWS_REGION
var sagemaker=new aws.SageMaker()
   
module.exports=function(){
    return new Promise((res,rej)=>{
        next(null,[])
        function next(token,list){
            sagemaker.listCodeRepositories({
                NextToken:token
            }).promise()
            .then(x=>{
                x.CodeRepositorySummaryList
                .map(y=>{return {
                    value:y.CodeRepositoryName,
                    text:y.CodeRepositoryName,
                    description:`${y.GitConfig.RepositoryUrl}:${x.GitConfig.Branch}`
                }})
                .map(y=>list.push(y))
                if(x.NextToken){
                    next(x.NextToken,list)
                }else{
                    res(list)
                }
            })
            .catch(e=>{
                console.log(e)
                rej(e)
            })
        }
    })
}
