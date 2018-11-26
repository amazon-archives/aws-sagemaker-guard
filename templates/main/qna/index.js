var fs=require('fs')
var _=require('lodash')


module.exports={
    "QNA":{
        "Type" : "AWS::CloudFormation::Stack",
        "Properties" : {
            "Parameters" : {
                Email:{"Ref":"AdminEmail" }
            },
            "TemplateURL" :"http://s3.amazonaws.com/aws-bigdata-blog/artifacts/aws-ai-qna-bot/templates/public.json",
        }
    },
    "LexWebUi":{
        "Type" : "AWS::CloudFormation::Stack",
        "Properties" : {
            "Parameters" : {
                BotName:{"Fn::GetAtt":["QNA","Outputs.BotName"]},
                CodeBuildName:{"Ref":"AWS::StackName"},
                WebAppParentOrigin:{"Fn::Sub":"https://${API}.execute-api.${AWS::Region}.amazonaws.com"},
                ShouldLoadIframeMinimized:true,
                WebAppConfBotInitialText:"Hello",
                WebAppConfBotInitialSpeech:"Hello",
                WebAppConfToolbarTitle:"SageGuard"
            },
            "TemplateURL" :"https://s3.amazonaws.com/aws-bigdata-blog/artifacts/aws-lex-web-ui/artifacts/templates/master.yaml",
        }
    },
    "QnABotContent":{
        "Type": "Custom::QnABotContent",
        "DependsOn":["CFNLambdaPolicy"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNQnABotImportLambda", "Arn"] },
            "content":require('./content'),
            "QnABotUrl":{"Fn::GetAtt":["QNA","Outputs.ClientURL"]}
        }
    }
}
