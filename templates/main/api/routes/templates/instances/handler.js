var aws=require('aws-sdk')
var _=require('lodash')
aws.config.region=process.env.AWS_REGION
var ec2=new aws.EC2()
var pricing=new aws.Pricing()
var kms=new aws.KMS()
var iam=new aws.IAM()
var glue=new aws.Glue()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    var instances=new Promise((res,rej)=>{
        next(null,[])
        function next(token,list){
            pricing.getProducts({
                ServiceCode:"AmazonSageMaker",
                Filters:[{
                    Field:"productFamily",
                    Type:"TERM_MATCH",
                    Value:"ML Instance"
                },{
                    Field:"location",
                    Type:"TERM_MATCH",
                    Value:"US East (N. Virginia)"
                }],
                MaxResults:100,
                NextToken:token
            }).promise()
            .then(x=>{
                x.PriceList.filter(y=>y.product.attributes.instanceType.match(/.*-Notebook/))
                .map(y=>list.push({
                    type:y.product.attributes.instanceType.match(/(.*)-Notebook/)[1],
                    cpus:y.product.attributes.vCpu,
                    ram:y.product.attributes.memory,
                    gpus:y.product.attributes.memory.physicalGpu,
                    gpu:y.product.attributes.memory.gpu,
                    price:_.toPairs(_.toPairs(y.terms.OnDemand)[0][1].priceDimensions)[0][1].pricePerUnit.USD
                }))
                console.log(1)
                if(x.NextToken){
                    next(x.NextToken,list)
                }else{
                    res(list)
                }
            })
        }
    })
    .then(x=>_.sortBy(x,y=>y.type).map(y=>{return {
        name:`${y.type}: \$${parseFloat(y.price).toFixed(3)}`,
        value:y.type
    }}))
    
    var roles=new Promise(function(res,rej){
        var out=[]

        function next(token){
            iam.listRoles({
                Marker:token
            }).promise()
            .then(result=>{
                console.log(result)
                result.Roles
                    .filter(filterRoles)
                    .map(x=>{return{
                        RoleName:x.RoleName,
                        Arn:x.Arn
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
    var keys=new Promise(function(res,rej){
        var out=[]

        function next(token){
            kms.listKeys({
                Marker:token,
                Limit:1000,
            }).promise()
            .then(result=>{
                console.log(result)
                result.Keys
                    .forEach(x=>out.push(x))

                if(result.Truncated){
                    next(result.NextMarker)
                }else{
                    res(out)
                }
            })
            .catch(rej)
        }
        next()
    })
   
    var endpoints=new Promise(function(res,rej){
        var out=[]

        function next(token){
            glue.getDevEndpoints({
                NextToken:token
            }).promise()
            .then(result=>{
                console.log(result)
                result.DevEndpoints
                    .forEach(x=>out.push(x.EndpointName))

                if(result.NextToken){
                    next(result.NextToken)
                }else{
                    res(out)
                }
            })
            .catch(rej)
        }
        next()
    })
    Promise.all([
        keys,
        roles,
        endpoints,
        instances
    ])
    .then(result=>callback(null,{
        keys:result[0],
        roles:result[1],
        endpoints:result[2],
        instances:result[3]
    }))
    .catch(error=>{
        console.log(error)
        callback(JSON.stringify({
            type:error.statusCode===404 ? "[NotFoud]" : "[InternalServiceError]",
            status:error.statusCode,
            message:error.message,
            data:error
        }))
    })
}

function filterRoles(result){
    var doc=JSON.parse(
        decodeURIComponent(result.AssumeRolePolicyDocument)
        )
    console.log(doc.Statement)        
    return doc.Statement
        .filter(x=>x.Principal.Service==="sagemaker.amazonaws.com")
        .length
}
