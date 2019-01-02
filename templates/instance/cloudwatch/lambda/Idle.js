var aws=require('aws-sdk')
var axios=require('axios')
aws.config.region=process.env.AWS_REGION || 'us-east-1'
var sagemaker=new aws.SageMaker()
var cf=new aws.CloudFormation()
var https=require('https')
var _=require('lodash')
var URL=require('url')

exports.handler=(event,context,cb)=>{
    console.log(JSON.stringify(event,null,2))
    var timeout=1000*60*process.env.IDLETIME
    var now=new Date()
    init({
        InstanceName:process.env.INSTANCE
    })
    .then(client=>{
        client.get("status")
        .then(response=>{
            console.log(JSON.stringify(response.data,null,2))
            if(response.data.connections!==0 ){
                return 
            }
            var now=new Date()
            var last=new Date(response.data.last_activity) 
            console.log(now-last,timeout)
            if(now-last > timeout){
                console.log("instance has timed out. will shutdown")     
            }else{
                console.log("instance has not timed out.")     
                return
            }
            
            return stop()
        })
    })
    .catch(console.log)
}

function stop(){
    return cf.describeStacks({
        StackName:process.env.STACKNAME
    }).promise()
    .then(x=>{
        if(["CREATE_COMPLETE","ROLLBACK_COMPLETE","UPDATE_COMPLETE","UPDATE_ROLLBACK_COMPLETE"].includes(x.Stacks[0].StackStatus)){
            var Parameters=_.fromPairs(x.Stacks[0].Parameters
                    .map(y=>[y.ParameterKey,y.ParameterValue]))
            
            Parameters.State="OFF"
            return cf.updateStack({
                StackName:process.env.STACKNAME,
                Capabilities:["CAPABILITY_NAMED_IAM"],
                UsePreviousTemplate:true,
                Parameters:_.toPairs(Parameters).map(y=>{return{
                    ParameterKey:y[0],
                    ParameterValue:y[1]
                }})
            }).promise()
            .catch(error=>{
                if(error.message!=="No updates are to be performed."){
                    throw error
                }
            })
        }else{
            throw new Error(`Stack currently in state ${x.Stacks[0].StackStatus}`)
        }
    })
}

function init(args){
    return sagemaker.createPresignedNotebookInstanceUrl({
        NotebookInstanceName:args.InstanceName
    }).promise()
    .then(function(result){ 
        var url=URL.parse(result.AuthorizedUrl)
        return axios({
            url:result.AuthorizedUrl,
            method:"GET",
            maxRedirects:0
        })
        .catch(error=>{
            if(error.response.status===302){
                console.log("authenticated")
                return axios.create({
                    baseURL:`https://${url.host}/api`,
                    headers:{
                        Cookie:error.response.headers['set-cookie'].join('; ')
                    }
                })
            }else{
                throw Error
            }
        })
    })
}
