#! /bin/bash
__dirname="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export AWS_PROFILE=$(node -e "console.log(require('$__dirname'+'/../config').profile)")
export AWS_DEFAULT_REGION=$(node -e "console.log(require('$__dirname'+'/../config').region)")

BUCKET=$( cat $__dirname/../config.json | $__dirname/json.js templateBucket)
PREFIX=$( cat $__dirname/../config.json | $__dirname/json.js templatePrefix)

echo $BUCKET/$PREFIX
aws s3 sync $__dirname/../build/ s3://$BUCKET/$PREFIX
