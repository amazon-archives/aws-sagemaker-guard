#! /bin/bash
set -ex 

stop amazon-ssm-agent
if [ ! -d /mnt/efs ]; then
    yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm amazon-efs-utils
    stop amazon-ssm-agent

    mkdir -p /mnt/efs
    mount -t efs ${EFS}:/ /mnt/efs
    mkdir -p /mnt/efs/${AWS::StackName}/ssm
    mount -t efs ${EFS}:/${AWS::StackName}/ssm /var/lib/amazon/ssm
fi

ID=$(cat /var/lib/amazon/ssm/Vault/Store/RegistrationKey | jq '.instanceID' --raw-output)
cat >> /etc/awslogs/awslogs.conf<<- EOM

[/var/log/jupyter.log]
file = /var/log/jupyter*
buffer_duration = 5000
log_stream_name = $ID-jupyter
/LifecycleConfigOnStartinitial_position = start_of_file
log_group_name = ${SSMLogGroup}
EOM
service awslogs restart

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

start amazon-ssm-agent
rm /etc/sudoers.d/cloud-init 

if [ "${GlueDevEndpoint}" != "EMPTY"];then 
    set -ex
    [ -e /home/ec2-user/glue_ready ] && exit 0
     
    mkdir /home/ec2-user/glue
    cd /home/ec2-user/glue
    DEV_ENDPOINT_NAME=${GlueDevEndpoint}
    aws s3 cp s3://aws-glue-jes-prod-us-east-1-assets/sagemaker/assets/ . --recursive
     
    tar -xf autossh-1.4e.tgz
    cd autossh-1.4e
    ./configure
    make
    sudo make install
    pip install pandas==0.22.0
     
    mkdir -p /home/ec2-user/.sparkmagic
    cp /home/ec2-user/glue/config.json /home/ec2-user/.sparkmagic/config.json
     
    mkdir -p /home/ec2-user/SageMaker/Glue\ Examples
    mv /home/ec2-user/glue/notebook-samples/* /home/ec2-user/SageMaker/Glue\ Examples/
     
    sudo cp /home/ec2-user/glue/autossh.conf /etc/init/
    python3 /home/ec2-user/glue/bootstrap.py --devendpointname $DEV_ENDPOINT_NAME --endpoint https://glue.${AWS::Region}.amazonaws.com --notebookname $ID
    sudo touch /home/ec2-user/glue_ready
fi
