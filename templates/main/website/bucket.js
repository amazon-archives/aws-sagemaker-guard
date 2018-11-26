module.exports={
    "WebsiteBucket":{
        "Type" : "AWS::S3::Bucket",
        "Properties" : {
            LifecycleConfiguration:{
                Rules:[{
                    NoncurrentVersionExpirationInDays:1,
                    Status:"Enabled"
                }]
            },
            "VersioningConfiguration":{
                "Status":"Enabled"
            },
            "WebsiteConfiguration":{
                "IndexDocument":"index.html"
            }       
        }
    },
    "WebsiteClear":{
        "Type": "Custom::S3Clear",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNS3ClearLambda", "Arn"] },
            "Bucket":{"Ref":"WebsiteBucket"},
        }
    },
    "WebsiteUnzip":{
        "Type": "Custom::S3Unzip",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNUnzipLambda", "Arn"] },
            "SrcBucket":{"Ref":"AssetBucket"},
            "Key":{"Fn::Sub":"${AssetPrefix}/website.zip"},
            "DstBucket":{"Ref":"WebsiteBucket"},
            "buildDate":new Date()
        },
        "DependsOn":"WebsiteClear"
    }
}

