var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var crypto=require('crypto')
var cf=new aws.CloudFormation()
var cd=new aws.CloudDirectory()
var s3=new aws.S3()
exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
  
    s3.getObject({
        Bucket:process.env.ASSETBUCKET,
        Key:`${process.env.ASSETPREFIX}/instance.json`
    }).promise()
    .then(result=>{
        var template=JSON.parse(result.Body.toString())
        var Parameters={}

        Object.keys(template.Parameters)
            .map(x=>{
                if(event.Attributes[x]){
                    Parameters[x]=event.Attributes[x]
                }
            })
        Parameters["SubnetId"]=process.env.SUBNET        
        Parameters["SecurityGroupId"]=process.env.SECURITYGROUP
        Parameters["EFS"]=process.env.EFS
        Parameters["SSMLogGroup"]=process.env.SSMLOGGROUP
        Parameters["LogsBucket"]=process.env.LOGSBUCKET
        Parameters["ParentStack"]=process.env.STACKNAME
        Parameters["LambdaUtilLayer"]=process.env.LAMBDAUTILLAYER

        return cf.createStack({
            StackName:event.Attributes.StackName,
            Capabilities:["CAPABILITY_NAMED_IAM"],
            EnableTerminationProtection:true,
            OnFailure:"DELETE",
            RoleARN:process.env.STACKCREATEROLE,
            Parameters:Object.keys(Parameters).map(x=>{return {
                ParameterKey:x,
                ParameterValue:Parameters[x]
            }}),
            TemplateURL:`https://s3.amazonaws.com/${process.env.ASSETBUCKET}/${process.env.ASSETPREFIX}/instance.json`,
            Tags:[{
                Key:"ParentStack",
                Value:process.env.STACKNAME
            },{
                Key:"Accessable",
                Value:"true"
            }]
        }).promise()
    })
    .then(result=>{
        callback(null,result)
    })
}
