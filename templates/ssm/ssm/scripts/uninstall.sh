#! /bin/bash

set -ex
CONDA=/home/ec2-user/anaconda3/bin/conda
TMP=/home/ec2-user/tmp

cat >> $TMP<<- EOM
{{ requirements }}
EOM

$CONDA uninstall --yes --name JupyterSystemEnv $( cat $TMP | tr -d '\n' )
rm $TMP
