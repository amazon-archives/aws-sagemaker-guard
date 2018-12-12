module.exports={
    "ElasticSearchDomain":{
        "Type": "Custom::ESDomain",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNElasticSearchArnLambda", "Arn"] },
            endpoint:{ "Fn::GetAtt" : ["QNA","Outputs.ElasticsearchEndpoint"] },
        }
    },
    "LoginFirehose": {
        "Type" : "AWS::KinesisFirehose::DeliveryStream",
        "DependsOn":["LoginsIndex"],
        "Properties" :{
            "DeliveryStreamType" : "DirectPut",
            "ElasticsearchDestinationConfiguration" : {
                "BufferingHints" : {
                    "IntervalInSeconds" : 60,
                    "SizeInMBs" : 5
                },
                "DomainARN" :{"Fn::Sub":"${ElasticSearchDomain.ARN}"},
                "IndexName" :"logins",
                "IndexRotationPeriod" : "NoRotation",
                "RetryOptions" : {
                    "DurationInSeconds" : 300
                },
                "RoleARN" : {"Fn::GetAtt" : ["FirehoseRole", "Arn"] },
                "S3BackupMode" : "AllDocuments",
                "S3Configuration" : {
                    "BucketARN":{"Fn::GetAtt":["LogsBucket","Arn"]},
                    "BufferingHints" : {
                        "IntervalInSeconds" : 60,
                        "SizeInMBs" : 5
                    },
                    "CompressionFormat":"GZIP",
                    "RoleARN" : {"Fn::GetAtt" : ["FirehoseRole", "Arn"] },
                    "Prefix":"Logins/"
                },
                "TypeName" : "login"
            },
        } 
    },
    "FirehoseRole":{
        "Type": "AWS::IAM::Role",
        "Properties": {
          "AssumeRolePolicyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                    "Service": "firehose.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
                }   
            ]
          },
          "Path": "/",
          "Policies": [ {
          "PolicyDocument" : {
            "Version": "2012-10-17",
            "Statement": [
              {
                "Sid": "",
                "Effect": "Allow",
                "Action": [
                  "s3:AbortMultipartUpload",
                  "s3:GetBucketLocation",
                  "s3:GetObject",
                  "s3:ListBucket",
                  "s3:ListBucketMultipartUploads",
                  "s3:PutObject"
                ],
                "Resource": [
                  {"Fn::GetAtt": ["LogsBucket", "Arn"]},
                  {"Fn::Join":["",[{"Fn::GetAtt": ["LogsBucket", "Arn"]},"/*"]]}
                ]
              },
              {
                "Sid": "",
                "Effect": "Allow",
                "Action": [
                  "logs:PutLogEvents"
                ],
                "Resource": [
                  {"Fn::Join": ["",["arn:aws:logs:",{ "Ref" : "AWS::Region" },":",{ "Ref" : "AWS::AccountId" },":log-group:/aws/kinesisfirehose/*"]]}
                ]
              },
                {
                "Sid": "a",
                "Effect": "Allow",
                "Action": ["es:*"],
                "Resource": ["*"]
              }
            ]
          },
          "PolicyName" : "SageGuardFirehose"
      }]
    }}
}
