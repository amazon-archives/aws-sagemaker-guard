var _=require('lodash')

module.exports= Object.assign(_.fromPairs(_.keys(
        _.omit(require('../../instance/params'),["OnCreateDeleteDocument","OnStartStopDocument"]) 
    )
    .map(x=>[x,{
        "type": "String",
        "description": x.Description || "Example",
        "default":x.Default || "Hello World"
    }])),
    {
        Event:{
            type:"String"
        },
        StackName:{
            type:"String"
        },
        InstanceId:{
            type:"String"
        },
        SSMRoleArn:{
            type:"String"
        }
    }
  )
