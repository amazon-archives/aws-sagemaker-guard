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
        
        opts.item.ID= event.requestContext.requestId
        opts.item.Requestor=opts.id
        opts.item.Status="pending"
        Promise.all([
            send({
                href:`${opts.base}/templates/instances`,
                method:"GET"
            }),
            dynamodb.put({
                TableName:opts.TableName,
                Item:opts.item,
                ReturnValues:"ALL_OLD"
            }).promise()
        ])
        .then(result=>{
            var schema=result[0].collection.template.data.schema
            schema.properties=_.omit(schema.properties,["ID","DisplayName"])
            schema.properties.Description.title="business purpose/justification"
            schema.properties.Description.description="please provide a use case description for this instance"
            schema.required.push("Description")

            console.log(JSON.stringify(result,null,2))
            var body={"collection":{
                "version":"1.0",
                "href":`${opts.href}?view=${opts.view}`,
                "links":[],
                "items":[Object.assign(opts.item,{
                    "href":`${opts.href}/${m.encode(_.pick(opts.item,["ID","Requestor"]))}?view=${opts.view}`
                })],
                "template":{
                    "data":{
                        "schema":schema,
                        "prompt":""
                    }
                },
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


