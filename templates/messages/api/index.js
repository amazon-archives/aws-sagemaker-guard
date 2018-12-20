var _=require('lodash')
var methods=[]
_.forEach(require('./routes'),(value,key)=>{
    value.Type==='AWS::ApiGateway::Method' ? methods.push(key) : null
})
var permissions=_.keys(require('./lambda')).filter(x=>x.match(/^InvokePermission/))

var lambdas=_.map(require('./lambda'),(value,key)=>{
    value.Type==='AWS::Lambda::Function' ? methods.push(key) : null
    return [key,{"Fn::GetAtt":[key,"Arn"]},value.Type]
})
.filter(x=>x[2]==='AWS::Lambda::Function')
.map(x=>x[0])

console.log(lambdas)
module.exports=Object.assign(
    require('./lambda'),
    require('./routes'),
{
    "APIGateWayPolicy":{
	   "Type" : "AWS::IAM::Policy",
	   "Properties" : {
		  "PolicyName" : "LambdaAccess",
		  "PolicyDocument" : {
          "Version": "2012-10-17",
          "Statement": [
                {
                  "Effect": "Allow",
                  "Action": [
                    "lambda:InvokeFunction"
                  ],
                  "Resource":lambdas.map(name=>{
                    return {"Fn::GetAtt":[name,"Arn"]}
                  })
                },
          ]
        },
		  "Roles" : [ {"Ref":"ApiGatewayRoleName"} ]
	  }    
    }
})


