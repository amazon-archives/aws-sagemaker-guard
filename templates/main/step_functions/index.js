var fs=require('fs')
var _=require('lodash')


module.exports={
    "StepFunctions":{
        "Type" : "AWS::CloudFormation::Stack",
        "DependsOn":["VPC"],
        "Properties" : {
            "Parameters" : {
                AssetBucket:{"Ref":"AssetBucket"},
                AssetPrefix:{"Ref":"AssetPrefix"},
                Directory:{"Ref":"Directory"},
                AppliedSchemaArn:{"Fn::GetAtt":["Directory","AppliedSchemaArn"]},
                StackName:{"Ref":"AWS::StackName"},
                Subnet:{"Fn::GetAtt":["VPC","Outputs.Subnet"]},
                SecurityGroup:{"Fn::GetAtt":["VPC","Outputs.NoteBookSecurityGroup"]},
                VPC:{"Fn::GetAtt":["VPC","Outputs.VPC"]},
                EFS:{"Fn::GetAtt":["VPC","Outputs.EFS"]},
                SSMLogGroup:{"Ref":"SSMLogGroup"},
                LogsBucket:{"Ref":"LogsBucket"},
                LambdaUtilLayer:{"Ref":"UtilLambdaLayer"}
            },
            "TemplateURL" :{"Fn::Sub":"https://s3.amazonaws.com/${AssetBucket}/${AssetPrefix}/step_functions.json"},
        }
    }
}
