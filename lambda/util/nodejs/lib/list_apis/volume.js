var _=require('lodash')
const prettyBytes = require('pretty-bytes');

module.exports=function(){
    return new Promise((res,rej)=>{
        var out=[5].concat(_.range(4,16,2)
            .map(x=>Math.min(Math.pow(2,x),16000)))
            .map(x=>{return {
                text:prettyBytes(x*1000000000),
                value:x
            }})
        res(out)
    })
}
