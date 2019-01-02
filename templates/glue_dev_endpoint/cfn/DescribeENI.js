var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()
var ec2=new aws.EC2()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    try{
        if(event.RequestType==="Delete"){
            ec2.describeNetworkInterfaces({
                Filters:[{
                    Name:"group-id",
                    Values:[params.SecurityGroup]
                }]
            }).promise()
            .then(x=>{
                console.log(JSON.stringify(x,null,2))
                if(x.NetworkInterfaces.length===0){
                    response.send(event, context, response.SUCCESS,params)
                }else{
                    recurse(event,callback,context)
                }
            })
            .catch(e=>{
                console.log(e)
                response.send(event, context, response.FAILED,params)
            })
        }else{
            response.send(event, context, response.SUCCESS,params)
        }
    }catch(e){
        console.log(e)
        response.send(event, context, response.FAILED,params)
    }
}

function recurse(event,callback,context){
    event.wait=true
    setTimeout(()=>lambda.invoke({
            FunctionName:process.env.AWS_LAMBDA_FUNCTION_NAME,
            InvocationType:"Event",
            Payload:JSON.stringify(event)
        }).promise()
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
        .then(()=>callback(null))
    ,5000)
}
