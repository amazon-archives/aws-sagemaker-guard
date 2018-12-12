module.exports=Object.assign(require('./firehose'),require('./proxy'),{
    "SSMLogGroup":{
        "Type" : "AWS::Logs::LogGroup",
        "Properties" : {}
    },
    "LogsBucket":{
        "Type" : "AWS::S3::Bucket",
        "Properties" :{} 
    },
    "LogsClear":{
        "Type": "Custom::S3Clear",
        "DependsOn":["VPC"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNS3ClearLambda", "Arn"] },
            "Bucket":{"Ref":"LogsBucket"},
        }
    },
    "LogsBucketPolicy" : {
        "Type" : "AWS::S3::BucketPolicy",
        "Properties" : {
            "Bucket" : {"Ref" : "LogsBucket"},
            "PolicyDocument" : {
                "Version": "2012-10-17",
                "Statement": [{
					"Sid": "SSMBucketPermissionsCheck",
					"Effect": "Allow",
					"Principal": {
						"Service": "ssm.amazonaws.com"
					},
					"Action": "s3:GetBucketAcl",
					"Resource": {"Fn::Sub":"arn:aws:s3:::${LogsBucket}"}
				},{
                    "Sid": " SSMBucketDelivery",
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "ssm.amazonaws.com"
                    },
                    "Action": "s3:PutObject",
					"Resource": {"Fn::Sub":"arn:aws:s3:::${LogsBucket}/ssm/*"},
                    "Condition": {
                        "StringEquals": {
                            "s3:x-amz-acl": "bucket-owner-full-control"
                        }
                    }
                },{
                    "Sid": "AWSLogDeliveryWrite",
                    "Effect": "Allow",
                    "Principal": {"Service": "delivery.logs.amazonaws.com"},
                    "Action": "s3:PutObject",
                    "Resource": {"Fn::Sub":"${LogsBucket.Arn}/vpc"},
                    "Condition": {
                        "StringEquals": {"s3:x-amz-acl": "bucket-owner-full-control"}
                    }
                },
                {
                    "Sid": "AWSLogDeliveryAclCheck",
                    "Effect": "Allow",
                    "Principal": {"Service": "delivery.logs.amazonaws.com"},
                    "Action": "s3:GetBucketAcl",
                    "Resource": {"Fn::GetAtt":["LogsBucket","Arn"]}
                },{
                    "Effect": "Allow",
                    "Principal": {
                      "AWS": "arn:aws:iam::386209384616:root"
                    },
                    "Action": [
                      "s3:GetBucketAcl",
                      "s3:GetBucketPolicy"
                    ],
                    "Resource": {"Fn::GetAtt":["LogsBucket","Arn"]}
                },
                {
                    "Effect": "Allow",
                    "Principal": {
                      "AWS": "arn:aws:iam::386209384616:root"
                    },
                    "Action": "s3:PutObject",
                    "Resource":{"Fn::Sub":"${LogsBucket.Arn}/*"},
                }]
            }
        }
    }
})

