var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var send=require('request').send
var _=require('lodash')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    Promise.all([
        send({
            href:`${process.env.API}/templates/instances`,
            method:"GET"
        }),
        send({
            href:`${process.env.API}/api/users`,
            method:"GET"
        })
    ])
    .then(results=>{
        instances=results[0]
        users=results[1]
        user_schema=users.collection.template.data.schema
        instance_schema=instances.collection.template.data.schema
         
        callback(null,{
            type:"object",
            properties:Object.assign(
                _.pick(user_schema.properties,["ID","Description","DisplayName"]),
                _.omit(user_schema.properties,["ID","Description","DisplayName"]),
                _.omit(instance_schema.properties,["ID","Description","DisplayName"])
            ),
            required:[].concat(user_schema.required).concat(instance_schema.required)
        })
    })
    .catch(e=>{
        console.log(e)
        callback(e)
    })
}

