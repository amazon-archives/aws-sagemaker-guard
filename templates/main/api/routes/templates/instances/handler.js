var aws=require('aws-sdk')
var _=require('lodash')
aws.config.region=process.env.AWS_REGION
var list_apis=require('list_apis')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    list_apis.run()
    .then(result=>schema(event,result))
    .then(body=>{
        callback(null,{
            statusCode:200,
            body:JSON.stringify(body)
        })
    })
    .catch(error=>{
        console.log(error)
        callback(JSON.stringify({
            type:error.statusCode===404 ? "[NotFoud]" : "[InternalServiceError]",
            status:error.statusCode,
            message:error.message,
            data:error
        }))
    })
}
function schema(event,input){
    var root=`https://${event.requestContext.apiId}.execute-api.${event.requestContext.Region}.amazonaws.com/${event.requestContext.stage}`

    return {"collection":{
        "version":"1.0",
        "href":`${root}/api/template/instances`,
        "template":{
            "data":{
                "schema":{
                    "type":"object",
                    "properties":{
                        "ID":{
                            "title":"Instance ID",
                            "description":"The unique identifier for this instance",
                            "type":"string",
                            "immutable":true,
                            "default":`${event.requestContext.requestId}`
                        },
                        "DisplayName":{
                            "title":"Instance DisplayName",
                            "description":"A friendly name for this instance",
                            "type":"string"
                        },
                        "Description":{
                            "title":"Instance Description",
                            "description":"A brief description of how this instance will be used",
                            "type":"string",
                            "maxLength":500
                        },
                        "CodeRepository":{
                            "description":"A git repository to associate with the notebook instance as its default code repository. When you open a notebook instance, it opens in the directory that contains this repository.",
                            "href":"https://docs.aws.amazon.com/sagemaker/latest/dg/nbi-git-repo.html",
                            "type":"string",
                            "title":"Git Code Repository",
                            "enum":input.repos
                        },
                        "AcceleratorType":{
                            "title":"Elastic Inference Accelerator",
                            "type":"string",
                            "description":"An Elastic Inference (EI) instance types to associate with this notebook instance",
                            "href":"https://docs.aws.amazon.com/sagemaker/latest/dg/ei.html",
                            "enum":input.eia
                        },
                        "InstanceType":{
                            "title":"Instance Compute Type",
                            "description":"The EC2 instance type for this notebook",
                            "type":"string",
                            "enum":input.instances,
                            "default":"ml.t3.medium"
                        },
                        "RoleArn":{
                            "title":"Instance IAM RoleArn",
                            "description":"Choose the IAM role that will give users on the notebook instance to call AWS APIs",
                            "type":"string",
                            "enum":input.roles.concat([{
                                "text":"Create Role",
                                "value":"CREATE",
                                "description":"Create a new role for this instance with the default sagemaker policy applied"
                            }]),
                            "default":"CREATE"
                        },
                        "KmsKeyId":{
                            "title":"KMS key Id",
                            "description":"A AWS KMS key to use for encrypting the data volumnes of the instance. The Key's policy must enable IAM management. See details for more information",
                            "type":"string",
                            "href":"https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html#key-policy-default-allow-root-enable-iam",
                            "immutable":true,
                            "enum":input.keys
                        },
                        "DirectInternetAccess":{
                            "title":"Enable/Disable Direct Internet Access",
                            "type":"string",
                            "immutable":true,
                            "enum":["Disabled","Enabled"],
                            "default":"Enabled"
                        },
                        "GlueDevEndpoint":{
                            "title":"Glue development endpoints",
                            "type":"string",
                            "enum":input.glue
                        },
                        "VolumeSize":{
                            "title":"EBS Volume size",
                            "description":"The size of the EBS volume attached to your instance",
                            "type":"string",
                            "default":"5",
                            "enum":input.volume
                        },
                        "OnCreateDeleteDocument":{
                            "title":"SSM OnCreateDelete Document",
                            "immutable":true,
                            "description":"An SSM document to run on instance creation and termination.",
                            "type":"string",
                            "enum":list_apis.doc(input,"OnCreateDelete")
                        },
                        "OnStartStopDocument":{
                            "title":"SSM OnStartStop Document",
                            "description":"An SSM document to run on each instance start up and stop.",
                            "type":"string",
                            "enum":list_apis.doc(input,"OnStartStop")
                        },
                        "IdleShutdown":{
                            "title":"Idle Shutdown Wait Period in minutes",
                            "description":"The number of minutes of inactivity before the instance is shutdown to save cost",
                            "type":"string",
                            "enum":[{
                                "value":"DISABLE",
                                "text":"disable",
                                "description":"leave instances running until they are manually show down"
                            },{
                                "value":"30",
                                "text":"30 minutes"
                            },{
                                "value":"45",
                                "text":"45 minutes"
                            },{
                                "value":"60",
                                "text":"1 hr"
                            }],
                            "default":"30"
                        }
                    },
                    "required":["ID","InstanceType","RoleArn"]
                }        
            }
        }
    }}
}
