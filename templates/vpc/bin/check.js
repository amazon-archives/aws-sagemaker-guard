#! /usr/bin/env node
var aws=require('./aws')
var fs=require('fs')
var Promise=require('bluebird')
var cf=new aws.CloudFormation()
var s3=new aws.S3()
var chalk=require('chalk')
var config=require('../config')
var bucket=config.templateBucket
var prefix=config.templatePrefix
var key=`${prefix}/${config.name}.json`

if(require.main === module){
    run()
}

module.exports=run
async function run(){
    var obj=require('..')
    var template=JSON.stringify(obj,null,2)
    
    await s3.putObject({
        Bucket:bucket,
        Key:key,
        Body:template
    }).promise()

    var result=await cf.validateTemplate({
        TemplateURL:`http://s3.amazonaws.com/${bucket}/${key}`
    }).promise()

    console.log(result)
    console.log(`Resources: ${Object.keys(obj.Resources).length}`)
    fs.writeFileSync(`${__dirname}/../build/${config.name}.json`,JSON.stringify(obj,null,2))
    return JSON.stringify(obj,null,2)
}
