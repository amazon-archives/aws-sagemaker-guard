#! /bin/bash
 
set -ex
[ -e /home/ec2-user/glue_ready ] && exit 0
 
mkdir /home/ec2-user/glue
cd /home/ec2-user/glue
DEV_ENDPOINT_NAME={{GlueDevEndpoint}}
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
python3 /home/ec2-user/glue/bootstrap.py --devendpointname $DEV_ENDPOINT_NAME --endpoint https://glue.{{Region}}.amazonaws.com --notebookname notebook
sudo touch /home/ec2-user/glue_ready
