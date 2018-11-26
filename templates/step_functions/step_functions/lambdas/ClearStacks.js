var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var cf=new aws.CloudFormation()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    cf.listStacks({
        StackStatusFilter:["CREATE_IN_PROGRESS","CREATE_FAILED","CREATE_COMPLETE","ROLLBACK_FAILED","ROLLBACK_COMPLETE","UPDATE_COMPLETE","DELETE_IN_PROGRESS"],
        NextToken:event.next
    }).promise()
    .then(result=>{
        console.log(JSON.stringify(result,null,2))
        return Promise.all(result.StackSummaries
            .map(stack=>stack.StackId)
            .map(id=>cf.describeStacks({StackName:id}).promise()))
            .then(results=>{
                var finished=true
                return Promise.all(results.map(x=>{
                    console.log(JSON.stringify(x,null,2))
                    var tags={}
                    x.Stacks[0].Tags.forEach(y=>tags[y.Key]=y.Value)
                    if(tags.ParentStack===params.StackName){
                        finished=false  
                        if(["CREATE_IN_PROGRESS","CREATE_FAILED","CREATE_COMPLETE","ROLLBACK_FAILED","ROLLBACK_COMPLETE","UPDATE_COMPLETE"].includes(x.Stacks[0].StackStatus)){
                            return cf.updateTerminationProtection({
                                EnableTerminationProtection:false,
                                StackName:x.Stacks[0].StackId
                            }).promise()
                            .then(()=>cf.deleteStack({
                                StackName:x.Stacks[0].StackId
                            }).promise())
                        }
                    }
                }))
                .then(()=>finished)
            })
            .then(finished=>{
                event.finished=finished
                if(finished && result.NextToken){
                    event.next=result.NextToken
                    event.finished=false
                }
                callback(null,event)
            })
    })
    .catch(error=>callback(new Error(error)))
}   
