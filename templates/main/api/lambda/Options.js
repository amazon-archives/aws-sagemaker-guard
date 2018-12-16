var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cognito=new aws.CognitoIdentityServiceProvider()
var send=require('request').send
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    if(event.pathParameters==="users"){
        send({
            href:`${event.requestContext.domainPrefix}.execute-api.${event.stageVariables.Region}.amazonaws.com/${event.path}`,
            method:"GET"
        })
        .then(x=>cognito.adminListGroupsForUser({
            UserPoolId: event.stageVariables.UserPool,
            Username:x.collection.items[0].data.ID
        }))
        .then(x=>{
            if(x.Groups.map(y=>y.GroupName).contains("Admin")){
                var Allow="OPTIONS, GET, PUT"
            }else{
                var Allow="OPTIONS, GET, PUT, DELETE"
            }
            callback(null,{
                statusCode:200,
                headers:{
                    Allow:Allow
                }
            })
        })
        .catch(callback)
    }else{
        callback(null,{
            statusCode:200,
            headers:{
                Allow:"OPTIONS, GET, PUT, DELETE"
            }
        })
    }
}

