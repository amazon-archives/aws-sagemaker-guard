var fs=require('fs')

module.exports={
    "schemaVersion": "2.2",
    "description": "Uninstall conda requirements.txt on a SageMaker notebook instance",
    "mainSteps": [
        {
            "action": "aws:runShellScript",
            "name": "runShellScript",
            "inputs": {
                "runCommand":[fs.readFileSync(`${__dirname}/scripts/uninstall.sh`,'utf-8')]
            }
        }
    ],
    "parameters": {
        "requirements": {
            "type": "String",
            "default": "Enabled",
            "displayType": "textarea",
            "description":"The contents of a requirements.txt file to be uninstalled on the SageMaker notebook instance"
        },
    }
}
