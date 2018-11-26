var response = require('cfn-response')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken

    try{
        response.send(event, context, response.SUCCESS,JSON.parse(params.Data))
    }catch(e){
        console.log(e)
        response.send(event, context, response.FAILED)
    }
}

