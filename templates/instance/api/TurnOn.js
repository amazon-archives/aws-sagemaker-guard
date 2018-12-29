var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var _=require('lodash')
var cf=new aws.CloudFormation()
var sagemaker=new aws.SageMaker()

var doc=process.env.ONSTART
var accessable="true"

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    
    cf.describeStacks({
        StackName:process.env.STACKNAME
    }).promise()
    .then(result=>{
        var params=_.fromPairs(result.Stacks[0].Parameters
            .map(x=>[x.ParameterKey,x.ResolvedValue || x.ParameterValue]))
        var tags=_.fromPairs(result.Stacks[0].Tags.map(x=>[x.Key,x.Value]))

        tags.Accessable=accessable
        outputs.StackName=stackname
        outputs.InstanceId=outputs.InstanceID

        cf.updateStack({
            StackName:process.env.STACKNAME
            Tags:_.toPairs(tags).map(x=>{return {
                Key:x[0],
                Value:[1]
            }})
        }).promise()
        .then(()=>sagemaker.startNotebookInstance({
            NotebookInstanceName:process.env.NOTEBOOK
        }).promise())
        .then(x=>{
            if(doc!=="EMPTY"){
                return ssm.sendCommand({
                    DocumentName:doc,
                    InstanceIds:process.env.INSTANCEID,
                    Parameters:_.mapValues(outputs,x=>[x])
                }).promise()
            }
        })
    })
    .then(()=>callback(null))
    .catch(e=>{
        console.log(e)
        callback(e)
    })
}
        

