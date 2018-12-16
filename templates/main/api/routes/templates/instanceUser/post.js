var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var send=require('request').send
var wait=require('wait')
var delay=require('delay')
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
        console.log(JSON.stringify(results,null,2))
        instances=results[0]
        users=results[1]
        user_properties=Object.keys(users.collection.template.data.schema.properties)
        instance_properties=Object.keys(instances.collection.template.data.schema.properties)
        
        user_data=_.pick(event.template.data,user_properties)
        instance_data=Object.assign({
            ID:`${user_data.ID}-instance`,
            Description:`${user_data.ID}'s instance` 
        },
            _.pick(event.template.data,instance_properties)
        )
        return Promise.all([
            send({
                href:`${process.env.API}/api/instances`,
                method:"POST",
                body:{template:{data:instance_data}}
            }),
            send({
                href:`${process.env.API}/api/users`,
                method:"POST",
                body:{template:{data:user_data}}
            })
        ])
        .then(x=>{
            console.log(JSON.stringify(x,null,2))
            var instance=x[0].collection.items[0].href.split('/').reverse()[0]
            var user=x[1].collection.items[0].href.split('/').reverse()[0]
            
            return send({
                href:`${process.env.API}/api/users/${user}/children/instances`,
                method:"POST",
                body:{template:{data:{ID:instance}}}
            })
            .then(()=>{return {
                user:user,
                instance:instance
            }})
        })
    })
    .catch(e=>{
        console.log(e)
        callback(e)
    })
}

