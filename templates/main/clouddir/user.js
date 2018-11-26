var _=require('lodash')

module.exports={
    type:"object",
    properties:{
        "ID":{
            type:"string",
            title:"ID",
            immutable:true
        },
        "email":{
            title:"User Email Address",
            type:"string"
        }
    },
    required:["ID","email"]
}

