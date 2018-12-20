var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var send=require('request').send
var _=require('lodash')
var lambda=new aws.Lambda()
var dynamodb = new aws.DynamoDB.DocumentClient();

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    try{
        var base=`https://${event.requestContext.domainPrefix}.execute-api.${event.stageVariables.Region}.amazonaws.com/${event.requestContext.stage}`
        var href=`${base}/${event.requestContext.path}`
        var id=event.requestContext.authorizer.claims["cognito:username"]
        var admin=isAdmin(event)
        var token=_.get(event.queryStringParameters,"NextToken")
         
        Promise.all([
            send({
                href:`${base}/templates/instances`,
                method:"GET"
            }),
            admin ? dynamodb.scan({
                TableName:process.env.INSTANCEREQUESTTABLE,
                ExclusiveStartKey:token ? decode(token) : null
            }).promise() : dynamodb.query({
                TableName:process.env.INSTANCEREQUESTTABLE,
                ExclusiveStartKey:token ? decode(token) : null,
                KeyConditionExpression:'Requestor = :x ',
                ExpressionAttributeValues:{
                    ":x":id
                }
            }).promise()
        ])
        .then(result=>{
            console.log(JSON.stringify(result,null,2))
            var next=result[1].LastEvaluatedKey ? encode(result[1].LastEvaluatedKey) : null
            var body={"collection":{
                "version":"1.0",
                "href":href,
                "links":next ? [
                    {"rel":"next","href":`${href}?NextToken=${next}`}
                ] : [],
                "items":result[1].Items.map(x=>{return Object.assign(x,{
                    "href":`${href}/${x.ID}`
                })}),
                "template":{
                    "data":{
                        "schema":result[0].collection.template.data.schema,
                        "prompt":"Request Creation of a new instance"
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

function isAdmin(event){
    var groups=event.requestContext.authorizer.claims["cognito:groups"]
    if(typeof groups ==="string"){
        return groups==="admins"
    }else{
        return groups.includes("admins")
    }
}

function encode(obj){
    return Buffer.from(JSON.stringify(obj)).toString('base64')
}

function decode(string){
    return JSON.parse(Buffer.from(string, 'base64').toString('ascii'))
}
