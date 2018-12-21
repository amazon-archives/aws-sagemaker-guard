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
        
        Promise.all([
            send({
                href:`${opts.base}/templates/instances`,
                method:"GET"
            }),
            dynamodb.get({
                TableName:opts.TableName,
                Key:opts.messageId
            }).promise()
        ])
        .then(result=>{
            var item=result[1].Item
            var schema=result[0].collection.template.data.schema
            schema.properties=_.omit(schema.properties,["ID","DisplayName"])
            schema.properties.Request=schema.properties.Description
            delete schema.properties.Description
            schema.required.push("Request")

            console.log(JSON.stringify(result,null,2))
            var body={"collection":{
                "version":"1.0",
                "href":`${opts.href}?view=${opts.view}`,
                "links":[],
                "items":[item],
                "template":item.response!=="Approved" ? !opts.admin ? {
                    "data":{
                        "schema":schema,
                        "prompt":"Edit request"
                    }
                } : {
                    data:{
                        schema:{
                            type:"object",
                            properties:{
                                response:{
                                    type:"string",
                                    enum:["Approve","Pending","Deny"]
                                },
                                comment:{
                                    type:"string",
                                    maxLength:500
                                }
                            },
                            required:["response"]
                        },
                        prompt:"respond to request"
                    }
                }:{},
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

