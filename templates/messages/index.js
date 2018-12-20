var fs=require('fs')
var _=require('lodash')

var files=fs.readdirSync(`${__dirname}`)
    .filter(x=>!x.match(/README.md|Makefile|index|test|bin|config|build/))
    .map(x=>require(`./${x}`))
var params=_.fromPairs(Object.keys(require('../main/messages').Messages.Properties.Parameters).map(x=>[x,{"Type":"String"}]))

module.exports={
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "Allow logged in Users to access AWS Console in other accounts",
  "Parameters":params,
  "Outputs":{},
  "Resources":_.assign.apply({},files)
}

