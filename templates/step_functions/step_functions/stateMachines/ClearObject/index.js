var fs=require('fs')
var _=require('lodash')

states={
    "Comment": "",
    "StartAt": "start",
    "States": {
        "start":{
            Type:"Pass",
            Next:"getInfo",
        },
        "getInfo":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionObjectGet.Arn}",
            ResultPath:"$.object",
            Next:"listIncoming"
        },
        "listIncoming":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionIncomingList.Arn}",
            ResultPath:"$",
            Next:"DeleteIncoming"
        },
        "DeleteIncoming":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionLinkDelete.Arn}",
            ResultPath:"$",
            Next:"IfIncomingNext"
        },
        "IfIncomingNext":{
            Type:"Choice",
            Choices:[{
                Variable:`$.next`,
                BooleanEquals:false,
                Next:`listOutGoing` 
            },{
                Variable:`$.next`,
                BooleanEquals:true,
                Next:`listIncoming` 
            }],
            Default:`listOutGoing`
        },
        "listOutGoing":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionOutGoingList.Arn}",
            ResultPath:"$",
            Next:"DeleteOutGoing"
        },
        "DeleteOutGoing":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionLinkDelete.Arn}",
            ResultPath:"$",
            Next:"IfOutGoingNext"
        },
        "IfOutGoingNext":{
            Type:"Choice",
            Choices:[{
                Variable:`$.next`,
                BooleanEquals:false,
                Next:`listPolicy` 
            },{
                Variable:`$.next`,
                BooleanEquals:true,
                Next:`listOutGoing` 
            }],
            Default:`listPolicy`
        },
        "listPolicy":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionPolicyList.Arn}",
            ResultPath:"$",
            Next:"DeletePolicyLinks"
        },
        "DeletePolicyLinks":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionPolicyClear.Arn}",
            ResultPath:"$",
            Next:"IfPolicyNext"
        },
        "IfPolicyNext":{
            Type:"Choice",
            Choices:[{
                Variable:`$.next`,
                BooleanEquals:false,
                Next:`DeleteObject` 
            },{
                Variable:`$.next`,
                BooleanEquals:true,
                Next:`listPolicy` 
            }],
            Default:`DeleteObject`
        },
        "DeleteObject":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionObjectDelete.Arn}",
            ResultPath:"$",
            Next:"DeleteTypeChoice"
        },
        "DeleteTypeChoice":{
            Type:"Choice",
            Choices:[{
                Variable:`$.Type`,
                StringEquals:"instances",
                Next:`DeleteInstance` 
            },{
                Variable:`$.Type`,
                StringEquals:"groups",
                Next:`DeleteGroup` 
            },{
                Variable:`$.Type`,
                StringEquals:"users",
                Next:`DeleteUser` 
            }],
            Default:`Success`
        },
        "DeleteUser":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionDeleteUser.Arn}",
            ResultPath:"$",
            Next:"Success"
        },
        "DeleteInstance":{
            Type:"Task",
            InputPath:"$",
            Resource:"${StepFunctionDeleteInstance.Arn}",
            ResultPath:"$",
            Next:"Success"
        },
        "DeleteGroup":{
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


