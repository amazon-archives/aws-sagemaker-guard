#! /bin/bash

CONDA=/home/ec2-user/anaconda3/bin/conda
NODE=/home/ec2-user/anaconda3/envs/JupyterSystemEnv/bin/node
TMP=/home/ec2-user/tmp

A=$($CONDA list --json | jq  '.' --raw-output -c)

CONTENT=$($NODE - << EndOfMessage
console.log(JSON.stringify(JSON.parse('$A')
    .map(x=>{
        var keys=Object.keys(x)
        var out={}
        keys.map(y=>{
            if(typeof x[y] ==='string'){
                out[y]=x[y]
            }else{
                out[y]=JSON.stringify(x[y])
            }
        })
        return out
    })))
EndOfMessage
)

echo "{\"SchemaVersion\" : \"1.0\", \"TypeName\": \"Custom:CondaPackages\", \"Content\":$CONTENT}" > $TMP

set -ex

ID=$(cat /var/lib/amazon/ssm/Vault/Store/RegistrationKey | jq '.instanceID' --raw-output)
mv $TMP /var/lib/amazon/ssm/$ID/inventory/custom/conda.json

