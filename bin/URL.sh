#! /bin/bash 
__dirname="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export AWS_PROFILE=$(node -e "console.log(require('$__dirname'+'/../config').profile)")
export AWS_DEFAULT_REGION=$(node -e "console.log(require('$__dirname'+'/../config').region)")

BUCKET=$( cat $__dirname/../config.json | $__dirname/json.js templateBucket)
PREFIX=$( cat $__dirname/../config.json | $__dirname/json.js templatePrefix)
REGION=$AWS_DEFAULT_REGION

MASTER="http://s3.amazonaws.com/$BUCKET/$PREFIX/main.json"

echo "========================Master=============="
echo "template url:"
echo "$MASTER"
echo ""
echo "console launch url:"
echo "https://console.aws.amazon.com/cloudformation/home?region=$REGION#/stacks/create/review?stackName=SageGuard&templateURL=$MASTER&param_AssetBucket=$BUCKET&param_AssetPrefix=$PREFIX&param_AdminUsername=Admin"
echo ""
echo ""
