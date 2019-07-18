#! /usr/bin/env node
var aws=require('aws-sdk')
var URL=require('url')
aws.config.region='us-east-1'
var s3=new aws.S3()

var Body=require('./content').qna
    .map(x=>JSON.stringify(x))
    .join('\n')

var bucket="sageguard-qna-166sb1ih3oczs-importbucket-4a1nb5anpm6t"
var key=`data/${(new Date()).getTime()}`

s3.putObject({
    Bucket:bucket,
    Key:key,
    Body:Body
}).promise()
.then(result=>{
    console.log(result)
})
.catch(e=>{
    console.log(e)
})


