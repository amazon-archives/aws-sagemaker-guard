var fs=require('fs')
var _=require('lodash')

var dirs=fs.readdirSync(__dirname)
    .filter(x=>!x.match(/(index.js)|(util)/))
    .map(x=>require(`./${x}`))

module.exports=_.assign.apply({},dirs)
