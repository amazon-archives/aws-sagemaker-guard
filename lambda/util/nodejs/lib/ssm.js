var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var _=require('lodash')
var ssm=new aws.SSM()

exports.start=function(config){
    return ssm.getDocument({
        Name:config.DocumentName
    }).promise()
    .then(x=>{
        console.log(JSON.stringify(x,null,2))
        var documentParams=_.get(JSON.parse(x.Content),"parameters",{})

        config.Parameters=_.pick(config.Parameters,_.keys(documentParams))
        config.DocumentType=x.DocumentType
        
        if(x.DocumentType==="Command"){
            return ssm.sendCommand(_.omit(config,["DocumentType","Mode"])).promise()
            .then(y=>{
                return {
                    id:y.Command.CommandId,
                    DocumentType:x.DocumentType
                }
            })
        }else if(x.DocumentType==="Automation"){
            return ssm.startAutomationExecution(_.omit(config,["DocumentType","InstanceIds","OutputS3BucketName","OutputS3KeyPrefix","OutputS3Region"])).promise()
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
