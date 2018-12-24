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
            opts.admin ? dynamodb.scan({
                TableName:process.env.INSTANCEREQUESTTABLE,
                ExclusiveStartKey:opts.token ? m.decode(opts.token) : null
            }).promise() : dynamodb.query({
                TableName:process.env.INSTANCEREQUESTTABLE,
                ExclusiveStartKey:opts.token ? m.decode(opts.token) : null,
                KeyConditionExpression:'Requestor = :x ',
                ExpressionAttributeValues:{
                    ":x":opts.id
                }
            }).promise()
        ])
        .then(result=>{
            var schema=result[0].collection.template.data.schema
            schema.properties=_.omit(schema.properties,["ID","DisplayName"])
            schema.properties.Description.title="business purpose/justification"
            schema.properties.Description.description="please provide a use case description for this instance"
            schema.required.push("Description")

            console.log(JSON.stringify(result,null,2))
            var next=result[1].LastEvaluatedKey ? m.encode(result[1].LastEvaluatedKey) : null
            var body={"collection":{
                "version":"1.0",
                "href":`${opts.href}?view=${opts.view}`,
                "links":(next ? [
                    {"rel":"next","href":`${opts.href}?NextToken=${next}`}
                ] : []).concat(
                    result[1].Items.map(x=>{return {
                    "href":`${opts.href}/${m.encode(_.pick(x,["ID","Requestor"]))}?view=${opts.view}`,
                    "rel":"collection"
                    }})
                ),
                "items":[{
                    "data":{
                        "title":"Request",
                        "description":"Request creation of sagemaker notebook instances from your administrator"
                    }
                }],
                "template":!opts.admin ? {
                    "data":{
                        "schema":schema,
                        "prompt":"Request Creation of a new instance"
                    },
                    href:`${opts.href}?view=${opts.view}`
                } : {},
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

