var fs=require('fs')
var _=require('lodash')

module.exports=Object.assign({
    "CheckIdle":{
        "Type" : "AWS::Events::Rule",
        "Properties" : {
            ScheduleExpression:"rate(1 hour)",
            Targets:[{
                "Arn":{"Fn::GetAtt":["CloudWatchIdleLambda","Arn"]},
                "Id":"idle",
            }]
        }
    },
},require('./lambda'))



