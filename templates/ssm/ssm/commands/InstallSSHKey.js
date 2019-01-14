var fs=require('fs')

module.exports={
    "schemaVersion": "2.2",
    "description": "Installs an SSH key on a SageMaker notebook instance. The key does not survive an instance reboot and must be reinstalled on each start up",
    "mainSteps": [
        {
            "action": "aws:runShellScript",
            "name": "runShellScript",
            "inputs": {
                "runCommand":[fs.readFileSync(`${__dirname}/scripts/ssh.sh`,'utf-8')]
            }
        }
    ],
    "parameters": {
        "PublicKey": {
            "type": "String",
            "default": "Enabled",
            "displayType": "textarea",
            "description":"The contents of the SSH public key to be installed on the instance"
        }
    }
}
