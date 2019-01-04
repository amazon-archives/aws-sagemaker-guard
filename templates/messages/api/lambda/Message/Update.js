var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var send=require('request').send
var m=require('messages')
var wait=require('wait')
var _=require('lodash')
var lambda=new aws.Lambda()
var dynamodb = new aws.DynamoDB.DocumentClient();

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    try{
        var opts=m.opts(event)

        if(!opts.admin && opts.item.Status){
            delete opts.item.Status
        }
        Promise.all([
            send({
                href:`${opts.base}/templates/instances`,
                method:"GET"
            }),
            dynamodb.update({
                TableName:opts.TableName,
                Key:opts.messageId,
                ReturnValues:"ALL_NEW",
                AttributeUpdates:_.mapValues(opts.item,x=>{
                    return {
                        Action:"PUT",
                        Value:x
                    }
                })
            }).promise()
        ])
        .then(result=>{
            console.log(JSON.stringify(result,null,2))
            var body={"collection":{
                "version":"1.0",
                "href":`${opts.href}?view=${opts.view}`,
                "links":[],
                "items":[Object.assign(opts.item,{
                    "href":`${opts.href}/${opts.messageId}?view=${opts.view}`
                })],
                "template":{},
                "queries":[]
            }}
            if(opts.admin){
                if(opts.item.Status==="Approve"){
                    Promise.all([
                        wait(opts.base,"users",opts.id),
                        send({
                            href:`${opts.base}/api/instances`,
                            method:"POST",
                            body:{
                                template:{data:result[1].Attributes}
                            }
                        })
                    ])
                    .then(results=>{
                        var user=results[0].collection.href.split('/').reverse()[0]
                        var instance=results[1].collection.href.split('/').reverse()[0]
                        return send({
                            href:`${opts.base}/api/users/${user}/children/instances`,
                            method:"POST",
                            body:{
                                template:{data:{ID:instance}}
                            }
                        })
                    })
                    .then(()=>{
                        body.collection.template={}
                        callback(null,{
                            statusCode:200,
                            body:JSON.stringify(body)
                        })
                    })
                    .catch(e=>{
                        console.log(e)
                        callback(null,{
                            statusCode:200,
                            body:JSON.stringify(e)
                        })
                    })
                }else{
                    callback(null,{
                        statusCode:200,
                        body:JSON.stringify(body)
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


