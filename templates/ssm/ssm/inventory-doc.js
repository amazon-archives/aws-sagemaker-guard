var fs=require('fs')

module.exports={
    "schemaVersion": "2.2",
    "description": "Run first a shell script & then inventory plugin.",
    "mainSteps": [
        {
            "action": "aws:runShellScript",
            "name": "runShellScript",
            "inputs": {
                "runCommand":[fs.readFileSync(`${__dirname}/scripts/conda.sh`,'utf-8')]
            }
        },
        {
            "action": "aws:softwareInventory",
            "name": "collectSoftwareInventoryItems",
            "inputs": {
                "applications": "Enabled",
                "awsComponents": "Enabled",
                "networkConfig": "Enabled",
                "customInventory": "Enabled",
                "files":"{{ files }}",
                "instanceDetailedInformation":"Enabled"
            }
        }
    ],
    "parameters": {
        "applications": {
            "type": "String",
            "default": "Enabled",
            "description": "(Optional) Collect data for installed applications.",
            "allowedValues": [
                "Enabled",
                "Disabled"
            ]
        },
        "awsComponents": {
            "type": "String",
            "default": "Enabled",
            "description": "(Optional) Collect data for AWSComponents like amazon-ssm-agent.",
            "allowedValues": [
                "Enabled",
                "Disabled"
            ]
        },
        "networkConfig": {
            "type": "String",
            "default": "Enabled",
            "description": "(Optional) Collect data for Network configurations.",
            "allowedValues": [
                "Enabled",
                "Disabled"
            ]
        },
        "files": {
          "type": "String",
          "default": "",
          "description": "<p>(Optional, requires SSMAgent version 2.2.64.0 and above)<br/><br/>Linux example:<br/><em>[{\"Path\":\"/usr/bin\", \"Pattern\":[\"aws*\", \"*ssm*\"],\"Recursive\":false},{\"Path\":\"/var/log\", \"Pattern\":[\"amazon*.*\"], \"Recursive\":true, \"DirScanLimit\":1000}]<br/></em><br/>Windows example:<br/><em>[{\"Path\":\"%PROGRAMFILES%\", \"Pattern\":[\"*.exe\"],\"Recursive\":true}]</em><br/><br/>Learn More: http://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-inventory-about.html#sysman-inventory-file-and-registry  </p>",
          "displayType": "textarea"
        },     
    }
}
