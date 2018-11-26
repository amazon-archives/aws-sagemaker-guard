#! /bin/bash

set -xe
A=$(cat ./tmp | jq  '.' --raw-output -c)
echo $A

B=$(node - << EndOfMessage
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
echo $B
