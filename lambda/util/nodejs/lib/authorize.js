var aws=require('aws-sdk')
var Promise=require('bluebird')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()

module.exports=function(userId,event){
    var instanceId=event.pathParameters.id
    var ListPolicyFunction=event.stageVariables.APICloudDirectoryPolicyListLambda

    return new Promise(function(res,rej){
        next()

        function next(NextToken){
            return lambda.invoke({
                FunctionName:ListPolicyFunction,
                InvocationType:"RequestResponse",
                Payload:JSON.stringify({
                    MaxResults:30,
                    NextToken:NextToken,
                    path:`/users/${userId}`,
                    Type:"users",
                    SubType:"instances",
                    ChildrenOrParents:"children"
                })
            }).promise()
            .then(function(result){
                console.log(result)
                var data=JSON.parse(result.Payload)
                var instances=data.Links.map(x=>x.TargetObjectReference.Selector.slice(1))
                if(instances.includes(instanceId)){
                    res(userId)
                }else if(result.NextToken){
                    next(result.NextToken)
                }else{
                    rej("notAuthorized")
                }
            })
        }
    })
}
