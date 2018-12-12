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
        },
        "phone_number":{
            title:"User Phone Number",
            description:"User's phone number used for MFA, in format +112345678901",
            pattern:"^\\+[0-9]{11}$",
            type:"string"
        }
    },
    required:["ID","email","phone_number"]
}

