#!/bin/bash
 
set -ex
if [ -e /home/ec2-user/glue_ready ];then 
    echo "configured"
else
    mkdir /home/ec2-user/glue
    cd /home/ec2-user/glue
    ID=$(cat /var/lib/amazon/ssm/Vault/Store/RegistrationKey | jq '.instanceID' --raw-output)
    ASSETS=s3://aws-glue-jes-prod-us-east-1-assets/sagemaker/assets/
    DEV_ENDPOINT_NAME= {{ endpoint }}
    aws s3 cp ${ASSETS} . --recursive
     
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
    python3 /home/ec2-user/glue/bootstrap.py --devendpointname {{ endpoint }} --endpoint https://glue.us-east-1.amazonaws.com --notebookname $ID
    sudo touch /home/ec2-user/glue_ready
fi
