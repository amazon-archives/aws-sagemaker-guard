var fs=require('fs')
var _=require('lodash')

states={
    "Comment": "",
    "StartAt": "start",
    "States": {
        "start":{
            Type:"Pass",
            Next:"delete",
        },
        "delete":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionClearStacks.Arn}",
            ResultPath:"$",
            Next:"check"
        },
        "check":{
            Type:"Choice",
            Choices:[{
                Variable:`$.finished`,
                BooleanEquals:false,
                Next:`wait` 
            }],
            Default:`finish`
        },
        "wait":{
            Type:"Wait",
            Seconds:10,
            Next:"delete",
        },
        "finish":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionFinish.Arn}",
            ResultPath:"$.object",
            Next:"Success"
        },
        "fail":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionFail.Arn}",
            ResultPath:"$.object",
            Next:"Error"
        },
        "Success": {
            Type:"Succeed"
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
            "Next":"fail"
        }]
    }
    return state
}

console.log(states)

module.exports=states


