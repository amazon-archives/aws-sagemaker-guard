#! /bin/bash
set -ex 

echo "{{PublicKey}}" >> /home/ec2-user/.ssh/authorized_keys
chmod 640 /home/ec2-user/.ssh/authorized_keys
