#! bin/bash
set -x
cd /home/ec2-user/SageMaker

mkdir -p SageBuild
cd SageBuild
aws s3 cp s3://${BUCKET}/${PREFIX}/notebooks.zip .
unzip notebooks.zip 
rm notebooks.zip
echo '{"Region":"{{Region}}","StackName":"{{StackName}}"}' > config.json

for notebook in $(find . | grep .ipynb); do
    jupyter trust $notebook
done

cd ..
chown "ec2-user" SageBuild --recursive 
