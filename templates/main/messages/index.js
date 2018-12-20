var fs=require('fs')
var _=require('lodash')


module.exports={
    "Messages":{
        "Type" : "AWS::CloudFormation::Stack",
        "Properties" : {
            "Parameters" : {
                AssetBucket:{"Ref":"AssetBucket"},
                AssetPrefix:{"Ref":"AssetPrefix"},
                StackName:{"Ref":"AWS::StackName"},
                API:{"Ref":"API"},
                APIURL:{"Fn::GetAtt":["URLs","API"]},
                CognitoAuthorizer:{"Ref":"CognitoAuthorizer"},
                UtilLambdaLayer:{"Ref":"UtilLambdaLayer"},
                WebsiteAPIResource:{"Ref":"WebsiteAPIResource"},
                "APILambdaRole":{"Ref":"APILambdaRole"},
                "APILambdaRoleArn":{"Fn::GetAtt":["APILambdaRole","Arn"]},
                ApiGatewayRole:{"Fn::GetAtt":["ApiGatewayRole","Arn"]},
                ApiGatewayRoleName:{"Ref":"ApiGatewayRole"}
            },
            "TemplateURL" :{"Fn::Sub":"https://s3.amazonaws.com/${AssetBucket}/${AssetPrefix}/messages.json"},
        }
    }
}
