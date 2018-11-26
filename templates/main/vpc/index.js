module.exports=Object.assign({
    "VPC":{
        "Type" : "AWS::CloudFormation::Stack",
        "DependsOn":["LogsBucketPolicy"],
        "Properties" : {
            "Parameters" : {
                "LogsBucketArn":{"Fn::GetAtt":["LogsBucket","Arn"]} ,
                "VPCEndpoints":{"Ref":"VPCEndpoints"},
                "CidrBlock":{"Ref":"CidrBlock"}
            },
            "TemplateURL" :{"Fn::Sub":"https://s3.amazonaws.com/${AssetBucket}/${AssetPrefix}/vpc.json"},
        }
    }
})
