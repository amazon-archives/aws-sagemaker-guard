var fs=require('fs')
var _=require('lodash')

states={
    "Comment": "",
    "StartAt": "start",
    "States": {
        "start":{
            Type:"Pass",
            Next:"CreateObject",
        },
        "CreateObject":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionInstanceObjectCreate.Arn}",
            ResultPath:"$",
            Next:"StackCreate"
        },
        "StackCreate":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionInstanceStackLaunch.Arn}",
            ResultPath:"$.stack",
            Next:"StackWait"
        },
        "StackWait":{
            Type:"Wait",
            Seconds:4,
            Next:"StackStatus",
        },
        "StackStatus":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionInstanceStatus.Arn}",
            ResultPath:"$.status",
            Next:"StackCheck"
        },
        "StackCheck":{
            Type:"Choice",
            Choices:[{
                Variable:`$.status.StackStatus`,
                StringEquals:"CREATE_IN_PROGRESS",
                Next:`StackWait` 
            },{
                Variable:`$.status.StackStatus`,
                StringEquals:"CREATE_COMPLETE",
                Next:`UpdateObject` 
            }],
            Default:`Error`
        },
        "UpdateObject":{
            Type:"Pass",
            Next:"Success"
        },
        "Success": {
            Type:"Pass",
            End:true
        },
        "Error":{
            Type:"Fail"
        }
    }
}

states.States=_.fromPairs(_.toPairs(states.States)
    .map(state=>{
        if(state[1].Type==="Task" || state[1].Type==="Parallel"){
            return addCatch(state)
        }else{
            return state
        }
    }))


function addCatch(state){
    if(state[0]!=="Error"){
        state[1].Catch=[{
            "ErrorEquals":["States.ALL"],
            "ResultPath":"$.error",
            "Next":"Error"
        }]
    }
    return state
}

console.log(states)

module.exports=states


