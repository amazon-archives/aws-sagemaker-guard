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
                href:`${api}/api/${type}/${id}`,
                method:"GET",
            })
            .then(results=>{
                console.log(results)
                if(count===0){
                    rej("timeout")
                }else{
                    setTimeout(()=>next(--count),100)
                }
            })
            .catch(e=>{
                console.log(e) 
                res()
            })
        }
    })
}

