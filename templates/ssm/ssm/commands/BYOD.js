var fs=require('fs')

module.exports={
    "schemaVersion": "2.2",
    "description": "install SageMaker BYOD project template",
    "mainSteps": [
        {
            "action": "aws:runShellScript",
            "name": "runShellScript",
            "inputs": {
                "runCommand":[fs.readFileSync(`${__dirname}/scripts/byod.sh`,'utf-8')]
            }
        }
    ],
    "parameters": {
        "BucketStack": {
            "type": "String"
        },
        "Region":{
            "type":"String"
        }
    }
}
