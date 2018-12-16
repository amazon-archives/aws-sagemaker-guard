var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var send=require('./request').send
var delay=require('./delay')
var _=require('lodash')

module.exports=function(api,type,id){
    return new Promise(function(res,rej){
        next(1000)
        function next(count){
            send({
                href:`${api}/api/${type}?Query=${id}`,
                method:"GET",
            })
            .then(result=>{
                return Promise.all(result.collection.items.map(x=>send({
                        href:x.href,
                        method:"GET"
                    })
                ))
            })
            .then(results=>{
                console.log(results)
                var items=results.filter(x=>x.collection.items[0].data.ID===id)
                if(items.length>0){
                    res(items[0])
                }else{
                    if(count===0){
                        rej("timeout")
                    }else{
                        setTimeout(()=>next(--count),100)
                    }
                }
            })
            .catch(rej)
        }
    })
}

