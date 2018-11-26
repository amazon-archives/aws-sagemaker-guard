var fs=require('fs')
var _=require('lodash')


module.exports={
    "SSM":{
        "Type" : "AWS::CloudFormation::Stack",
        "Properties" : {
            "Parameters" : {
                StackName:{"Ref":"AWS::StackName"},
                SSMLogGroup:{"Ref":"SSMLogGroup"},
                LogsBucket:{"Ref":"LogsBucket"}
            },
            "TemplateURL" :{"Fn::Sub":"https://s3.amazonaws.com/${AssetBucket}/${AssetPrefix}/ssm.json"},
        }
    }
}
