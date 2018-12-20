var fs=require('fs')
var UglifyJS = require("uglify-es");
var chalk=require('chalk')
var recursive = require('recursive-readdir-synchronous');
var _=require('lodash')
var len=__dirname.split('/').length
var lambdas=recursive(__dirname,['index.js'])
    .map(x=>{
        return x.split('/')
            .slice(len).join('/')
            .match(/(.*)\.js/)[1]
    })

module.exports=Object.assign(
    _.fromPairs(lambdas
        .map(name=>[`API${Name(name)}Lambda`,lambda(name)])),
    /*_.fromPairs(lambdas
        .map(name=>[`InvokePermission${Name(name)}Lambda`,permission(Name(name))])),*/
{
    "APILambdaPolicy":{
	   "Type" : "AWS::IAM::Policy",
	   "Properties" : {
		  "PolicyName" : "DynamoDBAccess",
		  "PolicyDocument" : {
			 "Version" : "2012-10-17",
			 "Statement": [ {
                 "Effect"   : "Allow",
                 "Action"   : [
                    "dynamodb:*",
                 ],
                 "Resource" : "*"
              }]
          },
		  "Roles" : [ {"Ref":"APILambdaRole"} ]
	  }    
    }
})

function lambda(name){
    var code=fs.readFileSync(__dirname+`/${name}.js`,'utf-8')
    var result = UglifyJS.minify(code,{mangle:false})
    if(result.error) throw `${name} ${result.error}`
    if(result.code.length<4096){
        console.log(`API:${Name(name)}`, chalk.green(`${result.code.length}/4096`))
    }else{
        console.log(`API:${Name(name)}`, chalk.red(`${result.code.length}/4096`))
    }
    return {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":result.code
        },
        "Handler": "index.handler",
        "MemorySize": "1024",
        "Role": {"Ref":"APILambdaRoleArn"},
        "Runtime": "nodejs6.10",
        Layers:[{"Ref":"UtilLambdaLayer"}],
        "Environment":{
            "Variables":{
                "INSTANCEREQUESTTABLE":{"Ref":"MessagesTable"} 
            }
        },
        "TracingConfig":{
            "Mode":"Active"
        },
        "Timeout": 60,
        "Tags":[{
            Key:"Type",
            Value:"ApiRouteHandler"
        }]
      }
    }
}
function Name(file){
    return file.replace('/','')
}
function permission(name){
    return {
      "Type": "AWS::Lambda::Permission",
      "Properties": {
        "Action": "lambda:InvokeFunction",
        "FunctionName":{"Fn::GetAtt":[`API${name}Lambda`,"Arn"]},
        "Principal": "apigateway.amazonaws.com"
      }
    }
}



