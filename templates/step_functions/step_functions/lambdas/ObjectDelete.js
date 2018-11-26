var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cd=new aws.CloudDirectory()
var lambda=new aws.Lambda()
var step=new aws.StepFunctions()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    return cd.batchWrite({
        DirectoryArn:process.env.DIRECTORY,
        Operations:[{
            DetachFromIndex:{
                IndexReference:{
                    Selector:`/index/${event.Type}`
                },
                TargetReference:{
                    Selector:`\$${event.ID}`
                }
            }
        },{
            DetachObject:{
                BatchReferenceName:"object",
                LinkName:event.object.ID,
                ParentReference:{
                    Selector:`/${event.Type}`
                }
            }
        },{
            DeleteObject:{
                ObjectReference:{
                    Selector:`#object`
                }
            }
        }]
    }).promise()
    .then(()=>callback(null,event))
    
}
