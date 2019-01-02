var fs=require('fs')

module.exports={
    GlueDevEndpoint:{
        "Type" : "AWS::Glue::DevEndpoint",
        "DependsOn":["EndpointSecurityGroupIngress","EndpointRole","ENIWait"],
        "Properties" : {
            EndpointName:{"Ref":"AWS::StackName"},
            NumberOfNodes:"2",
            RoleArn:{"Fn::GetAtt":["EndpointRole","Arn"]},
            SecurityGroupIds:[{"Ref":"EndpointSecurityGroup"}],
            SubnetId:{"Ref":"SubnetId"},
            PublicKey:fs.readFileSync(__dirname+'/key.pub','utf-8')
        }
    },
    "EndpointSecurityGroup": {
      "Type": "AWS::EC2::SecurityGroup",
      "Properties": {
        "VpcId": {"Ref": "VPC"},
        "GroupDescription": "Allow Access",
        "SecurityGroupIngress": [{
            IpProtocol:"tcp",
            SourceSecurityGroupId:{"Ref":"SecurityGroupId"},
            FromPort:0,
            ToPort:65535,
      }]
      }
	},
    "ENIWait":{
        "Type": "Custom::Variable",
        "DependsOn":["EndpointSecurityGroup","EndpointRole"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["DescribeENILambda", "Arn"] },
            "SecurityGroup":{"Ref":"EndpointSecurityGroup"}
        }
    },
    "EndpointSecurityGroupIngress": {
      "Type": "AWS::EC2::SecurityGroupIngress",
      "DependsOn":["EndpointSecurityGroup"],
      "Properties": {
            GroupId:{"Ref":"EndpointSecurityGroup"},
            IpProtocol:"tcp",
            SourceSecurityGroupId:{"Ref":"EndpointSecurityGroup"},
            FromPort:0,
            ToPort:65535,
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
    },
    "RoleName":{
        "Type": "Custom::RoleName",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["RoleNameLambda", "Arn"] },
            "Arn":{"Ref":"SSMRoleArn"}
        }
    },
    "AccessPolicy":{
      "Type": "AWS::IAM::ManagedPolicy",
      "Properties": {
        "PolicyDocument": {
          "Version": "2012-10-17",
          "Statement":[{
            Effect:"Allow",
            Action:[
                "glue:GetDevEndpoint",
                "glue:UpdateDevEndpoint"
            ],
            "Resource":{"Fn::Sub":"arn:aws:glue:${AWS::Region}:${AWS::AccountId}:devEndpoint/${GlueDevEndpoint}"}
          }]
        },
        Roles:[{"Ref":"RoleName"}]
      }
    }   
}
