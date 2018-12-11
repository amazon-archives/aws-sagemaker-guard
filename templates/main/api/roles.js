var _=require('lodash')
var lambdas=[]
_.forEach(
    Object.assign({},require('./lambda'),require('./routes'))
,(value,key)=>{
    value.Type==='AWS::Lambda::Function' ? lambdas.push(key) : null
})

module.exports={
"AdminPolicy": {
  "Type": "AWS::IAM::ManagedPolicy",
  "Properties": {
    "PolicyDocument": {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [   
            "execute-api:*"
          ],
          "Resource": [{"Fn::Sub":
            "arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${API}/${Constants.ApiStageName}/*/*/*"
            },{"Fn::Sub":
            "arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${API}/${Constants.ApiStageName}/*"
            }]
        }
      ]
    },
    "Roles":[{"Ref":"AdminRole"}]
  }
},
"ApiGatewayCloudWatchLogsRole": {
  "Type": "AWS::IAM::Role",
  "Properties": {
    "AssumeRolePolicyDocument": {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": [
              "apigateway.amazonaws.com"
            ]
          },
          "Action": [
            "sts:AssumeRole"
          ]
        }
      ]
    },
    "Policies": [
      {
        "PolicyName": "ApiGatewayLogsPolicy",
        "PolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams",
                "logs:PutLogEvents",
                "logs:GetLogEvents",
                "logs:FilterLogEvents"
             ],
              "Resource": "*"
            }
          ]
        }
      }
    ]
  }
},
"ApiGatewayRole": {
  "Type": "AWS::IAM::Role",
  "Properties": {
    "AssumeRolePolicyDocument": {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": [
              "apigateway.amazonaws.com"
            ]
          },
          "Action": [
            "sts:AssumeRole"
          ]
        }
      ]
    },
    "Policies": [
      {
        "PolicyName": "ApiGatewayLogsPolicy",
        "PolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "lambda:InvokeFunction"
              ],
              "Resource":lambdas.map(name=>{
                return {"Fn::GetAtt":[name,"Arn"]}
              })
            },
            {
              "Effect": "Allow",
              "Action": ["s3:GetObject"],
              "Resource":[{"Fn::Sub":"arn:aws:s3:::${WebsiteBucket}/*"}]
            }
          ]
        }
      }
    ]
  }
}
}
