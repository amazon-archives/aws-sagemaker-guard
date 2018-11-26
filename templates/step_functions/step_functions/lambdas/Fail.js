var response = require('cfn-response')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken

    response.send(event, context, response.FAILED)
}

