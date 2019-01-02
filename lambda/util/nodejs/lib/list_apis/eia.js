var aws=require('aws-sdk')
var _=require('lodash')
aws.config.region=process.env.AWS_REGION
var pricing=new aws.Pricing({region:"us-east-1"})
   
module.exports=function(){
    return new Promise((res,rej)=>{
        next(null,[])
        function next(token,list){
            pricing.getProducts({
                ServiceCode:"AmazonEI",
                Filters:[{
                    Field:"location",
                    Type:"TERM_MATCH",
                    Value:process.env.REGIONNAME
                },],
                MaxResults:100,
                NextToken:token
            }).promise()
            .then(x=>{
                x.PriceList
                .map(y=>{
                    var price=_.values(_.values(y.terms.OnDemand)[0].priceDimensions)[0].pricePerUnit.USD
                    var name=y.product.attributes.usagetype.match(/.*-(.*)/)[1]
                    var price=parseFloat(price).toFixed(3)
                    return {
                        text:`ml.${name} \$${price}`,
                        value:`ml.${name}`
                    }
                })
                .map(y=>list.push(y))
                if(x.NextToken){
                    next(x.NextToken,list)
                }else{
                    res(list)
                }
            })
            .catch(e=>{
                console.log(e)
                rej(e)
            })
        }
    })
}
