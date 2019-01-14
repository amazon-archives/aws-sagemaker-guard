var aws=require('aws-sdk')
var response = require('cfn-response')
var CfnLambda = require('cfn-lambda');
var _=require('lodash')
aws.config.region=process.env.AWS_REGION
var ssm=new aws.SSM()
var util=require('ssm')
var lambda=new aws.Lambda()

exports.handler=CfnLambda({
    Create:(params,reply)=>Run(params,reply,"Create"),
    Update:(id,params,old,reply)=>reply(null,id),
    Delete:(id,params,reply)=>Run(params,reply,"Delete"),
    LongRunning:{
        PingInSeconds:5,
        MaxPings:100000,
        LambdaApi:lambda,
        Methods:{
            Create:(context,params,reply,recurse)=>{
                check(context,params,reply,recurse)
            },
            Delete:(context,id,params,reply,recurse)=>{
                check(context,params,reply,recurse)
            }
        }
    }
})

function Run(params,reply,event){
    return util.start(_.set(params.config,'Parameters.Event',[event]))
    .then(x=>reply(null,x.id,x))
    .catch(err=>reply(err))
}

function check(context,params,reply,recurse){
    return get(context.PhysicalResourceId,params,context.Data)
    .then(status=>{
        if(status==="Success"){
            reply(null,context.PhysicalResourceId)
        }else if(["Pending","InProgress","Delayed"].includes(status)){
            recurse()
        }else{
            reply(status)
        }
    })
    .catch(reply)
}

function get(id,params,data){
    if(data.DocumentType==="Command"){
        return ssm.getCommandInvocation({
            CommandId:id,
            InstanceId:params.config.InstanceIds[0]
        }).promise()
        .then(x=>x.Status)
    }else{
        return ssm.describeAutomationExecutions({
            Filters:[{
                Key:"ExecutionId",
                Values:[id]
            }]
        }).promise()
        .then(x=>x.AutomationExecutionMetadataList[0].AutomationExecutionStatus)
    }
}

