var response = require('cfn-response')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    response.send(event, context, response.SUCCESS,{
        value:encodeURIComponent(params.value)   
    })
}

