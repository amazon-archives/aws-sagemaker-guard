var fs=require('fs')
var _=require('lodash')
var util=require('./util')
var lambdas=require('./lambdas')

var widgets=[util.Title("# ${AWS::StackName} Dashboard",0)]
widgets=widgets.concat(lambdas(util.yOffset(widgets)))

module.exports={widgets}
