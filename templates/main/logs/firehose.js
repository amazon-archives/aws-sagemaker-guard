module.exports={
    "LoginFirehose": {
        "Type" : "AWS::KinesisFirehose::DeliveryStream",
        "Properties" : {
            "DeliveryStreamType" : "DirectPut",
            "S3DestinationConfiguration" : {
                "BucketARN":{"Fn::GetAtt":["LogsBucket","Arn"]},
                "BufferingHints" : {
                    "IntervalInSeconds" : 60,
                    "SizeInMBs" : 5
                },
                "CompressionFormat":"GZIP",
                "RoleARN" : {"Fn::GetAtt" : ["FirehoseRole", "Arn"] },
                "Prefix":"Logins/"
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
              }
            ]
          },
          "PolicyName" : "SageGuardFirehose"
      }]
    }}
}
