var response = require('cfn-response')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    try{
        var params=event.ResourceProperties
        var name=params.Arn.match(/arn:.*:.*::.*:role\/(.*)/)[1]

        response.send(event, context, response.SUCCESS,params,name)
    }catch(e){
        console.log(e)
        response.send(event, context, response.FAILED,params,name)
    }
}
