var aws=require('aws-sdk')
var _=require('lodash')
aws.config.region=process.env.AWS_REGION
var pricing=new aws.Pricing({region:"us-east-1"})

module.exports=function(){
    return new Promise((res,rej)=>{
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
                    Value:process.env.REGIONNAME
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
                    gpus:y.product.attributes.physicalGpu,
                    gpu:y.product.attributes.gpu,
                    price:_.toPairs(_.toPairs(y.terms.OnDemand)[0][1].priceDimensions)[0][1].pricePerUnit.USD
                }))
                if(x.NextToken){
                    next(x.NextToken,list)
                }else{
                    res(list)
                }
            })
        }
    })
    .then(x=>_.sortBy(x,y=>parseFloat(y.price)).map(y=>{return {
        name:`${y.type}: \$${parseFloat(y.price).toFixed(3)}`,
        value:y.type,
        description:y.gpus==="None" ? 
            `vCPUs:${y.cpus} Memory:${y.ram}` :
            `vCPUs:${y.cpus} Memory:${y.ram} GPUs:${y.gpu}`
    }}))
} 
    
