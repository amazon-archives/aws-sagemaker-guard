var fs=require('fs')

module.exports={
    "schemaVersion": "2.2",
    "description": "installs and configures the aws-sagemaker-build project to provide a CI/CD environment for SageMaker",
    "mainSteps": [
        {
            "action": "aws:runShellScript",
            "name": "runShellScript",
            "inputs": {
                "runCommand":[fs.readFileSync(`${__dirname}/scripts/sagebuild.sh`,'utf-8')]
            }
        }
    ],
    "parameters": {
        "Bucket": {
            "type": "String"
        },
        "Region":{
            "type":"String"
        },
        "Prefix":{
            "type":"String"
        },
        "StackName":{
            "type":"String"
        }
    }
}
