var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var send=require('request').send
var _=require('lodash')
var m=require('messages')
var lambda=new aws.Lambda()
var dynamodb = new aws.DynamoDB.DocumentClient();

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    try{
        var opts=m.opts(event)
        
        dynamodb.delete({
            TableName:process.env.INSTANCEREQUESTTABLE,
            Key:opts.messageId
        }).promise()
        .then(result=>{
            console.log(JSON.stringify(result,null,2))
            var body={"collection":{
                "version":"1.0",
                "href":`${opts.href}?view=${opts.view}`,
                "links":[],
                "items":[],
                "queries":[]
            }}
            callback(null,{
                statusCode:200,
                body:JSON.stringify(body)
            })
        })
    }catch(e){
        console.log(e)
        callback(null,{
            responseCode:500,
            body:e
        })
    }
}


