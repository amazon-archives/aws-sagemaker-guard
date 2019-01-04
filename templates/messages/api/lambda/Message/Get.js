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
            if(!opts.admin){
                item=_.omit(item,["Requestor","ID"])
            }
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
                "template":item.Status!=="Approve" ? !opts.admin ? {
                    "data":{
                        "schema":schema,
                        "prompt":"Edit request"
                    },
                    "href":`${opts.href}?view=${opts.view}`
                } : {
                    data:{
                        schema:{
                            type:"object",
                            properties:{
                                Status:{
                                    type:"string",
                                    title:"Status",
                                    description:"Approve or deny the request",
                                    enum:["Approve","Pending","Deny"]
                                },
                                comment:{
                                    type:"string",
                                    title:"Comment",
                                    description:"provide a comment back to the request",
                                    maxLength:500
                                }
                            },
                            required:["Status"]
                        },
                        prompt:"respond to request"
                    },
                    "href":`${opts.href}?view=${opts.view}`
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
            statusCode:500,
            body:e
        })
    }
}

