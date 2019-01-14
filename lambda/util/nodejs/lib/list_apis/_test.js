process.env.ASSETBUCKET="jmc-website"
process.env.ASSETPREFIX="sageguard-dev"
process.env.AWS_REGION="us-east-1"
process.env.STACKNAME="SageGuard-v2-1"
process.env.REGIONNAME="US East (N. Virginia)"

require('./index').run()
