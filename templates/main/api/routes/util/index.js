var clean=require('clean-deep')
var fs=require('fs')
var _=require('lodash')

exports.proxy=require('./proxy')
exports.redirect=require('./redirect')
exports.mock=require('./mock')
exports.lambda=require('./lambda')

exports.resource=function(path,parent={"Fn::GetAtt": ["API","RootResourceId"]}){
    return {
      "Type": "AWS::ApiGateway::Resource",
      "Properties": {
        "ParentId": parent,
        "PathPart": path,
        "RestApiId": {"Ref": "API"}
      }
    }
}


    
