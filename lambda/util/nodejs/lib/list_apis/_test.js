process.env.ASSETBUCKET="jmc-website"
process.env.ASSETPREFIX="sageguard"
process.env.AWS_REGION="us-east-1"
require('./index')().then(console.log)
