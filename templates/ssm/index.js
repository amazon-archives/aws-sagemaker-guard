var fs=require('fs')
var _=require('lodash')

var params={
    StackName:{
        "Type":"String"
    },
    SSMLogGroup:{
        "Type":"String"
    },
    LogsBucket:{
        "Type":"String"
    },

}

module.exports={
  "Parameters":params,
  "Conditions":_.fromPairs(_.toPairs(params)
        .filter(x=>x[1].Default)
        .map(x=>x[0])
        .map(x=>[`If${x}`, 
            x.Type==="CommaDelimitedList" ?
                {"Fn::Not":[{"Fn::Equals":[{"Fn::Join":["",{"Ref":x}]},""]}]}:
                {"Fn::Not":[{"Fn::Equals":[{"Ref":x},"EMPTY"]}]}
            ]
        )
  ),
  "Outputs":{
    
  },
  "Resources":Object.assign({},
    require('./cfn'),
    require('./ssm'),
    require('./glue')
  ),
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description":"",
  
}
console.log(JSON.stringify(module.exports.Conditions))
