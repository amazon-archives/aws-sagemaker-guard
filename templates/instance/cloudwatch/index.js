var fs=require('fs')
var _=require('lodash')

module.exports=Object.assign({
    "CheckIdle":{
        "Type" : "AWS::Events::Rule",
        "Condition":"YesIdleCheck",
        "Properties" : {
            ScheduleExpression:{"Fn::Sub":"rate(${IdleShutdown} minutes)"},
            Targets:[{
                "Arn":{"Fn::GetAtt":["CloudWatchIdleLambda","Arn"]},
                "Id":"idle",
            }]
        }
    },
},require('./lambda'))



