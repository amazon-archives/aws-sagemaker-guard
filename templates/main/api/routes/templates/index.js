var _=require('lodash')
var util=require('../util')
var fs=require('fs')
var schema=require('../../../clouddir/schema')
var handlebars=require('handlebars')
var UglifyJS = require("uglify-es");
var chalk=require('chalk')

var lambdas=fs.readdirSync(__dirname)
    .filter(x=>x!=="index.js")
    .map(template)

module.exports=Object.assign({
    "Templates":util.resource('templates')
    },
    _.fromPairs(_.flatten(lambdas))
)
function template(name){
    var out=[
        [
            `${name}Template`,
            util.resource(name,{"Ref":"Templates"})
        ],
        [
            `${name}TemplateGet`,
            fs.existsSync(`${__dirname}/${name}/req.vm`)?
                util.lambda({
                    resource:{"Ref":`${name}Template`},
                    method:"GET",
                    lambda:`API${name}TemplateLambda`,
                    req:fs.readFileSync(`${__dirname}/${name}/req.vm`,'utf-8'),
                    res:fs.readFileSync(`${__dirname}/${name}/res.vm`,'utf-8'),
                    parameter:{
                        locations:{
                            "method.request.querystring.SourceID":false,
                            "method.request.querystring.SourceType":false,
                            "method.request.querystring.DestType":false,
                            "method.request.querystring.Type":false,
                            "method.request.querystring.ID":false,
                        }
                    }
                })
            : util.lambda({
                resource:{"Ref":`${name}Template`},
                method:"GET",
                type:"AWS_PROXY",
                lambda:`API${name}TemplateLambda`,
            })
        ],
        [
            `API${name}TemplateLambda`,
            lambda(name,"handler")
        ]
    ]
    if(fs.existsSync(`${__dirname}/${name}/post.js`)){
        out.push([
            `API${name}PostTemplateLambda`,
            lambda(name,"post")
        ])
        out.push([
            `${name}TemplatePost`,
            util.lambda({
                resource:{"Ref":`${name}Template`},
                method:"POST",
                lambda:`API${name}PostTemplateLambda`,
                req:fs.readFileSync(`${__dirname}/${name}/post.req.vm`,'utf-8'),
                res:fs.readFileSync(`${__dirname}/${name}/post.res.vm`,'utf-8'),
                parameter:{
                    locations:{
                        "method.request.querystring.SourceID":false,
                        "method.request.querystring.SourceType":false,
                        "method.request.querystring.DestType":false,
                        "method.request.querystring.Type":false,
                        "method.request.querystring.ID":false,
                    }
                }
            })
        ])
    }
    return out
}

function lambda(name,handler){
    var code=fs.readFileSync(__dirname+`/${name}/${handler}.js`,'utf-8')
    var result = UglifyJS.minify(code,{mangle:true})
    if(result.error) throw `${name} ${result.error}`
    if(result.code.length<4096){
        console.log(`API:${name}`, chalk.green(`${result.code.length}/4096`))
    }else{
        console.log(`API:${name}`, chalk.red(`${result.code.length}/4096`))
    }
    return {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":result.code
        },
        "Handler": "index.handler",
        "MemorySize":_.get({
            "instances":"3008"
        },name,"896"),
        "Role": {"Fn::GetAtt": ["APILambdaRole","Arn"]},
        "Runtime": "nodejs6.10",
        Layers:[{"Ref":"UtilLambdaLayer"}],
        "Environment":{
            "Variables":{
                "ATTACHMENTLISTLAMBDA":{"Ref":"APICloudDirectoryAttachmentListLambda"},
                "POLICYLISTLAMBDA":{"Ref":"APICloudDirectoryPolicyListLambda"},
                "INDEXLISTLAMBDA":{"Ref":"APICloudDirectoryIndexListLambda"},
                "OBJECTGETLAMBDA":{"Ref":"APICloudDirectoryObjectGetLambda"},
                DIRECTORY:{"Ref":"Directory"},
                SCHEMA:{"Fn::GetAtt":["Directory","AppliedSchemaArn"]},
                API:{"Fn::GetAtt":["URLs","API"]},
                REGIONNAME:{"Fn::FindInMap":["RegionMap",{"Ref":"AWS::Region"},"name"]},
                ASSETBUCKET:{"Ref":"AssetBucket"},
                ASSETPREFIX:{"Ref":"AssetPrefix"},
                STACKNAME:{"Ref":"AWS::StackName"}
            }
        },
        "TracingConfig":{
            "Mode":"Active"
        },
        "Timeout": 60,
        "Tags":[{
            Key:"Type",
            Value:"ApiTemplate"
        }]
      }
    }
}
function permission(name){
    return {
      "Type": "AWS::Lambda::Permission",
      "Properties": {
        "Action": "lambda:InvokeFunction",
        "FunctionName":{"Fn::GetAtt":[`API${name}TemplateLambda`,"Arn"]},
        "Principal": "apigateway.amazonaws.com"
      }
    }
}


