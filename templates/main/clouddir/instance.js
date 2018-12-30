var _=require('lodash')

module.exports={
    type:"object",
    properties:{
        "ID":{
            type:"string",
            immutable:true
        },
        "DisplayName":{
            type:"string"
        },
        "Description":{
            type:"string"
        },
        "StackName":{
            type:"string",
            immutable:true,
        },
    },
    required:["ID"]
}

