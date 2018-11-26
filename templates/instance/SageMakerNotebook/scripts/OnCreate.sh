#! /bin/bash
set -ex 

stop amazon-ssm-agent
yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm amazon-efs-utils
stop amazon-ssm-agent

mkdir -p /mnt/efs
mount -t efs ${EFS}:/ /mnt/efs
mkdir -p /mnt/efs/${AWS::StackName}/ssm
rm -rf /mnt/efs/${AWS::StackName}/ssm/*

mount -t efs ${EFS}:/${AWS::StackName}/ssm /var/lib/amazon/ssm


cat > /etc/amazon/ssm/seelog.xml <<- EOM
<seelog type="adaptive" mininterval="2000000" maxinterval="100000000" critmsgcount="500" minlevel="info">
    <exceptions>
        <exception filepattern="test*" minlevel="error"/>
    </exceptions>
    <outputs formatid="fmtinfo">
        <console formatid="fmtinfo"/>
        <rollingfile type="size" filename="/var/log/amazon/ssm/amazon-ssm-agent.log" maxsize="30000000" maxrolls="5"/>
        <filter levels="error,critical" formatid="fmterror">
            <rollingfile type="size" filename="/var/log/amazon/ssm/errors.log" maxsize="10000000" maxrolls="5"/>
        </filter>
        <custom name="cloudwatch_receiver" formatid="fmtdebug" data-log-group="${SSMLogGroup}"/>
    </outputs>    
    <formats>
        <format id="fmterror" format="%Date %Time %LEVEL [%FuncShort @ %File.%Line] %Msg%n"/>        
        <format id="fmtdebug" format="%Date %Time %LEVEL [%FuncShort @ %File.%Line] %Msg%n"/>
        <format id="fmtinfo" format="%Date %Time %LEVEL %Msg%n"/>    
    </formats>
</seelog>
EOM

amazon-ssm-agent -register -y \
    -code "${SSMActivation.ActivationCode}" \
    -id "${SSMActivation.ActivationId}" \
    -region "${AWS::Region}"

start amazon-ssm-agent

ID=$(cat /var/lib/amazon/ssm/Vault/Store/RegistrationKey | jq '.instanceID' --raw-output)
/opt/aws/bin/cfn-signal --success=true --data=$ID --id=id "${WaitHandle}"
