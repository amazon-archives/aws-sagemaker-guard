var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION || 'us-east-1'
var sagemaker=new aws.SageMaker()
var cf=new aws.CloudFormation()
var https=require('https')
var URL=require('url')

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    var timeout=1000*60*process.env.IDLETIME
    var now=new Date()
    send({
        InstanceName:process.env.INSTANCE,
        path:"/api/kernels/",
        method:"GET"
    })
    .then(result=>{
        console.log(JSON.stringify(result,null,2))
        if(result){
            var busy=result
            .filter(x=>x.kernel.connections>0)
            .filter(x=>x.kernel.execution_state!=="idle")
            .filter(x=>{
                var last=new Date(x.kernel.last_activity) 
                return now-last < timeout 
            }).length
        }else{
            return stop()
        }
        if(!busy){
            send({
                InstanceName:process.env.INSTANCE,
                path:`/api/status`,
                method:"GET"
            })
            .then(x=>{
                var last=new Date(x.last_activity) 
                if(now-last > timeout){
                    return Promise.all(result.map(x=>x.path)
                    .then(path=>send({
                        InstanceName:process.env.INSTANCE,
                        path:`/api/contents/${path}/checkpoints`,
                        method:"POST"
                    })))
                    .then(stop)
                }
            })
            .then(console.log)
        }
    })
    .catch(console.log)
}

function stop(){
    return cf.describeStacks({
        StackName:stackname
    }).promise()
    .then(x=>{
        if(["CREATE_COMPLETE","ROLLBACK_COMPLETE","UPDATE_COMPLETE","UPDATE_ROLLBACK_COMPLETE"].includes(x.Stacks[0].StackStatus)){
            var Parameters=_.fromPairs(x.Stacks[0].Parameters
                    .map(y=>[y.ParameterKey,y.ParameterValue]))
            
            Parameters.State="OFF"
            return cf.updateStack({
                StackName:result.attributes.StackName,
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

function send(args){
    return sagemaker.createPresignedNotebookInstanceUrl({
        NotebookInstanceName:args.InstanceName
    }).promise()
    .then(function(result){ 
        console.log(result)
        var url=URL.parse(result.AuthorizedUrl)
        console.log(url)
        return new Promise(function(res,rej){ 
            var opts={
                hostname:url.hostname,
                protocol:url.protocol,
                post:443,
                path:`${url.pathname}${url.search}`,
                method:'GET'
            }
            console.log(opts)
            var req=https.request(opts,x=>{
                opts.headers={
                    Cookie:x.headers['set-cookie'].join('; ')
                }
                opts.path=x.headers.location
                res(opts)
            })
            req.on('error',rej)
            req.end()
        })
    })
    .then(opts=>{
        console.log(opts)
        return new Promise(function(res,rej){
            var req=https.request(opts,x=>{
                opts.path=x.headers.location
                res(opts)
            })
            req.on('error',rej)
            req.end()
        })
    })
    .then(opts=>{
        console.log(opts)
        return new Promise(function(res,rej){
            var req=https.request(opts,x=>{
                opts.path=args.path
                opts.method=args.method
                res(opts)
            })
            req.on('error',rej)
            req.end()
        })
    })
    .then(opts=>{
        var body=[]
        console.log(opts)
        return new Promise(function(res,rej){
            var req=https.request(opts,response=>{
                response.on('data',chunk=>{
                    body.push(chunk)
                })
                response.on('end',()=>{
                    res(Buffer.concat(body).toString())
                })
            })
            if(args.body){
                req.write(args.body)
            }
            req.on('error',rej)
            req.end()
        })
    })
    .then(x=>{
        try{
            return JSON.parse(x)
        }catch(e){
            return x
        }
    })
}
