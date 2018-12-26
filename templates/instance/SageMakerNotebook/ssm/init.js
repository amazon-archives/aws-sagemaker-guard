var fs=require('fs')

module.exports={
    "schemaVersion": "2.2",
    "description": "install conda requirements",
    "mainSteps": [
        {
            "action": "aws:runShellScript",
            "name": "runShellScript",
            "inputs": {
                "runCommand":[fs.readFileSync(`${__dirname}/scripts/init.sh`,'utf-8')]
            }
        }
    ],
    "parameters": {}
}
