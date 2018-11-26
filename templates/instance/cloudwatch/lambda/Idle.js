var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION || 'us-east-1'
var sagemaker=new aws.SageMaker()
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
            return sagemaker.stopNotebookInstance({
                NotebookInstanceName:process.env.INSTANCE,
            }).promise()
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
                    .then(x=>sagemaker.stopNotebookInstance({
                        NotebookInstanceName:process.env.INSTANCE,
                    }).promise())    
                }
            })
            .then(console.log)
        }
    })
    .catch(console.log)
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
