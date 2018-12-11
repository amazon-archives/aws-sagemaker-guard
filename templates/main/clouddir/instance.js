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
        "InstanceType":{
            type:"string",
            enum:["ml.t2.medium","ml.m4.xlarge","ml.p2.xlarge","ml.p3.2xlarge"],
            immutable:true,
            default:"ml.t2.medium"
        },
        "RoleArn":{
            type:"string"
        },
        "KmsKeyId":{
            type:"string",
            immutable:true
        },
        "StackName":{
            type:"string",
            immutable:true,
        },
        "DirectInternetAccess":{
            type:"string",
            enum:["Disabled","Enabled"],
            default:"Enabled",
            immutable:true,
        },
        IdleShutdown:{
            type:"string",
            enum:["30","60","120"],
            default:"60"
        },
        GlueDevEndpoint:{
            type:"string"
        }
    },
    required:["ID","InstanceType","RoleArn"]
}

