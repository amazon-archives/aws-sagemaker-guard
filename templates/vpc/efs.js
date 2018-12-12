module.exports={
    "EFS":{
        "Type" : "AWS::EFS::FileSystem",
        "Properties" : {}
    },
    "EFSMount":{
        "Type" : "AWS::EFS::MountTarget",
        "DependsOn":["subnet1","EFSSecurityGroup"],
        "Properties" : {
            FileSystemId:{"Ref":"EFS"},
            SecurityGroups:[{"Ref":"EFSSecurityGroup"}],
            SubnetId:{"Ref":"subnet1"}
        }
    },
    "EFSSecurityGroup": {
      "Type": "AWS::EC2::SecurityGroup",
      "DependsOn":["subnet1"],
      "Properties": {
        "VpcId": {"Ref": "VPC"},
        "GroupDescription": "Allow Access",
        "SecurityGroupIngress": [{
            "FromPort": "2049",
            "ToPort": "2049",
            "IpProtocol": "tcp",
            "SourceSecurityGroupId":{"Fn::GetAtt":["NoteBookSecurityGroup","GroupId"]}
          }
        ]}
	},
    "NoteBookSecurityGroup": {
      "Type": "AWS::EC2::SecurityGroup",
      "DependsOn":["subnet1"],
      "Properties": {
        "VpcId": {"Ref": "VPC"},
        "GroupDescription": "Allow Access",
        "SecurityGroupIngress": []
      }
	},
    "NoteBookSecurityGroupIngress":{
        "Type" : "AWS::EC2::SecurityGroupIngress",
        "Properties" : {
            "GroupId":{"Fn::GetAtt":["NoteBookSecurityGroup","GroupId"]},
            "FromPort": "443",
            "ToPort": "443",
            "IpProtocol": "tcp",
            "SourceSecurityGroupId":{"Fn::GetAtt":["EndpointSecurityGroup","GroupId"]}
          }
    }
}
