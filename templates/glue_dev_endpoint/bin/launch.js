#! /usr/bin/env node
var check=require('./check')
var aws=require('./aws')
var config=require('../config')
var cf=new aws.CloudFormation({region:config.region})
var name=require('./name')
var bucket=config.templateBucket
var prefix=config.templatePrefix
var wait=require('./wait')
var _=require('lodash')
if(require.main===module){
    run()
}
console.log(`http://s3.amazonaws.com/${bucket}/${prefix}/${config.name}.json`)
async function run(){
    var template=await check()
    await name.inc()
    var result=await cf.createStack({
        StackName:await name.get(),
        Capabilities:["CAPABILITY_NAMED_IAM"],
        DisableRollback:true,
        TemplateURL:`http://s3.amazonaws.com/${bucket}/${prefix}/${config.name}.json`,
        Parameters:Object.keys(config.parameters)
            .map(param=>{return{
                ParameterKey:param,
                ParameterValue:config.parameters[param]
            }})
    }).promise()
    await wait()
}
