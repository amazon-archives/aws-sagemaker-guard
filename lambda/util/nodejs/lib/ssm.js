var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var _=require('lodash')
var ssm=new aws.SSM()

exports.start=function(config){
    return ssm.getDocument({
        Name:config.DocumentName
    }).promise()
    .then(x=>{
        config.DocumentType=x.DocumentType
        if(x.DocumentType==="Command"){
            return ssm.sendCommand(_.omit(config,["DocumentType"])).promise()
            .then(y=>{
                return {
                    id:y.Command.CommandId,
                    DocumentType:x.DocumentType
                }
            })
        }else if(x.DocumentType==="Automation"){
            return ssm.startAutomationExecution(_.omit(config,["DocumentType"])).promise()
            .then(y=>{
                return {
                    id:y.AutomationExecutionId,
                    DocumentType:x.DocumentType
                }
            })
        }else{
            throw "invalid document type"
        }
    })
}
