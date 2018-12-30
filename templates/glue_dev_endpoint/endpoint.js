module.exports={
    GlueDevEndpoint:{
        "Type" : "AWS::Glue::DevEndpoint",
        "Properties" : {
            EndpointName:{"Ref":"AWS::StackName"},
            NumberOfNodes:"2",
            RoleArn:{"Fn::GetAtt":["EndpointRole","Arn"]},
            SecurityGroupIds:{"Ref":"EndpointSecurityGroup"},
            SubnetId:{"Ref":"SubnetId"}
        }
    },
    "EndpointSecurityGroup": {
      "Type": "AWS::EC2::SecurityGroup",
      "Properties": {
        "VpcId": {"Ref": "VPC"},
        "GroupDescription": "Allow Access",
        "SecurityGroupIngress": []
      }
	},
    "EndpointRole":{
      "Type": "AWS::IAM::Role",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": "glue.amazonaws.com"
              },
              "Action": "sts:AssumeRole"
            }
          ]
        },
        "Path": "/",
        "ManagedPolicyArns": [
            "arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"
        ]
      }
    }
}
