exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    
    callback(JSON.stringify(event))
}
