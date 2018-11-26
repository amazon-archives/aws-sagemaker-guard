var _=require('lodash')

module.exports={
    type:"object",
    properties:{
        "ID":{
            type:"string",
            title:"User ID",
            immutable:true
        },
        "DisplayName":{
            title:"Display Name",
            type:"string"
        },
        "Description":{
            title:"Group Description",
            type:"string"
        }
    },
    required:["ID"]
}

