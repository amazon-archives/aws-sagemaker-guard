var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var send=require('request').send
var m=require('messages')
var _=require('lodash')
var lambda=new aws.Lambda()
var dynamodb = new aws.DynamoDB.DocumentClient();

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    try{
        var opts=m.opts(event)
        
        Promise.all([
            send({
                href:`${opts.base}/templates/instances`,
                method:"GET"
            }),
            dynamodb.put({
                TableName,
                Item:Object.assign(opts.item,m.decode(opts.messageId)),
                ReturnValues:"ALL_NEW"
            }).promise()
        ])
        .then(result=>{
            var item=result[0].Attributes
            console.log(JSON.stringify(result,null,2))
            var body={"collection":{
                "version":"1.0",
                "href":`${href}?view=${opts.view}`,
                "links":[],
                "items":[Object.assign(opts.item,{
                    "href":`${opts.href}/${opts.messageId}?view=${opts.view}`
                })],
                "template":{},
                "queries":[]
            }}
            if(admin){
                if(opts.item.Status==="Approve"){
                    Promise.all([
                        wait(opts.base,"users",opts.id),
                        send({
                            href:`${opts.base}/templates/instances`,
                            method:"POST",
                            body:JSON.stringify({
                                template:{data:item}
                            })
                        })
                    ])
                    .then(results=>{
                        var user=results[0].collection.href.split('/').reverse()[0]
                        var instance=results[1].collection.href.split('/').reverse()[0]
                        return send({
                            href:`${process.env.API}/api/users/${user}/children/instances`,
                            method:"POST",
                            body:JSON.stringify({
                                template:{data:{ID:instance}}
                            })
                        })
                    })
                    .then(()=>{
                        body.collection.template={}
                        callback(null,{
                            statusCode:200,
                            body:JSON.stringify(body)
                        })
                    })
                }
            }else{
                callback(null,{
                    statusCode:200,
                    body:JSON.stringify(body)
                })
            }
        })
    }catch(e){
        console.log(e)
        callback(null,{
            responseCode:500,
            body:e
        })
    }
}


