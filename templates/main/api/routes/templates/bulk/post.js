var delay=require('delay')
var _=require('lodash')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    Promise.all(event.template.data.users.map(user=>send({
        href:`${process.env.API}/templates/instanceUser`,
        method:"POST",
        body:{template:{data:Object.assign(
            user,
            _.omit(event.template.data,"users")
        )}}
    })))
    .then(results=>callback(null,_.flatten(results)))
    .catch(e=>{
        console.log(e)
        callback(e)
    })
}

