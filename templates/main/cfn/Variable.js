var response = require('cfn-response')
var crypto = require('crypto');

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken
    var hash = crypto.createHash('md5').update(JSON.stringify(params)).digest('hex');


    response.send(event, context, response.SUCCESS,params,hash)
}

