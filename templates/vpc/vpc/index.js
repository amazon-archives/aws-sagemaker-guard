module.exports=Object.assign({
    "RouteTable": {
      "Type": "AWS::EC2::RouteTable",
      "Properties": {
        "VpcId": {"Ref": "VPC"}
      }
    },
    "PublicRouteTable": {
      "Type": "AWS::EC2::RouteTable",
      "Properties": {
        "VpcId": {"Ref": "VPC"}
      }
    },
    "subnet1": {
      "Type": "AWS::EC2::Subnet",
      "Properties": {
        "AvailabilityZone": {
          "Fn::Select": [
            0,
            {
              "Fn::GetAZs": {
                "Ref": "AWS::Region"
              }
            }
          ]
        },
        "CidrBlock": {"Ref":"CidrBlock"},
        "MapPublicIpOnLaunch": false,
        "VpcId": {
          "Ref": "VPC"
        }
      }
    },
    "SubnetPublicAssociation1": {
      "Type": "AWS::EC2::SubnetRouteTableAssociation",
      "Properties": {
        "RouteTableId": {
          "Ref": "RouteTable"
        },
        "SubnetId": {
          "Ref": "subnet1"
        }
      }
    },
    "VPC": {
      "Type": "AWS::EC2::VPC",
      "Properties": {
        "CidrBlock": {"Ref":"CidrBlock"},
        "EnableDnsSupport": "true",
        "EnableDnsHostnames": "true",
        "Tags": [
          {
            "Key": "Name",
            "Value":{"Ref":"AWS::StackName"} 
          }
        ]
      }
    },
    "VPCS3Endpoint":{
        "Type": "AWS::EC2::VPCEndpoint",
        "Condition":"IfEnableVPCEndpoints",
        "Properties": {
            VpcId:{"Ref":"VPC"},
            RouteTableIds:[{"Ref":"RouteTable"}],
            ServiceName:{"Fn::Sub":"com.amazonaws.${AWS::Region}.s3"},
            "PolicyDocument": {
                "Version": "2012-10-17",
                "Statement": [{
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:*"],
                    "Resource": ["*"]
                }]
            }
        }
    },
    "VPCSSMEndpoint":endpoint("ssm"),
    "VPCEC2MessagesEndpoint":endpoint("ec2messages"),
    "VPCEC2Endpoint":endpoint("ec2"),
    "VPCSSMMessagesEndpoint":endpoint("ssmmessages"),
    "VPCSageMakerEndpoint":endpoint("sagemaker.api"),
    "VPCSageMakerRuntimeEndpoint":endpoint("sagemaker.runtime"),
    "VPCLogsEndpoint":endpoint("logs"),
    "EndpointSecurityGroup": {
      "Type": "AWS::EC2::SecurityGroup",
      "Properties": {
        "VpcId": {"Ref": "VPC"},
        "GroupDescription": "Allow Access",
        "SecurityGroupIngress": [{
            "FromPort": "443",
            "ToPort": "443",
            "IpProtocol": "tcp",
            "SourceSecurityGroupId":{"Fn::GetAtt":["NoteBookSecurityGroup","GroupId"]}
          }
        ]}
	},
    "FlowLog":{
        "Type" : "AWS::EC2::FlowLog",
        "Properties" : {
            "LogDestination":{"Fn::Sub":"${LogsBucketArn}/vpc"},
            "LogDestinationType":"s3",
            "ResourceId" : {"Ref":"VPC"},
            "ResourceType" : "VPC",
            "TrafficType" : "ALL"
        }
    }
})

function endpoint(name){
    return {
        "Type": "AWS::EC2::VPCEndpoint",
        "Condition":"IfEnableVPCEndpoints",
        "Properties": {
            VpcId:{"Ref":"VPC"},
            VpcEndpointType:"Interface",
            PrivateDnsEnabled:true,
            SubnetIds:[{"Ref":"subnet1"}],
            SecurityGroupIds:[{"Ref":"EndpointSecurityGroup"}],
            ServiceName:{"Fn::Sub":`com.amazonaws.\${AWS::Region}.${name}`},
        }
    }
}
