var _=require('lodash')

module.exports= Object.assign(_.fromPairs(_.keys(
        _.omit(require('../../instance/params'),["OnCreateDocument","OnTerminateDocument",   "OnStartDocument"]) 
    )
    .map(x=>[x,{
        "type": "String",
        "description": x.Description || "Example",
        "default":x.Default || "Hello World"
    }])),
    {
        StackName:{
            type:"String"
        },
        InstanceId:{
            type:"String"
        }
    }
  )
