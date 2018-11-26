var _=require('lodash')

exports.schema={
  "sourceSchemaArn": "",
  "facets": {
    "groups": {
      "objectType": "NODE",
      "facetAttributes": attributes(require('./group'))
    },
    "users": {
      "objectType": "LEAF_NODE",
      "facetAttributes":attributes(require('./user'))
    },
    "instances": {
      "objectType": "POLICY",
      "facetAttributes":attributes(require('./instance')) 
    },
    "Root":{
      "objectType": "NODE",
      "facetAttributes": {
        "Type":{
            attributeDefinition: {
                "attributeType": "STRING",
                "isImmutable":true,
                "attributeRules": {
                    "nameLength":{ 
                        "parameters": {
                          "min":"0",
                          "max":"256" 
                        },
                        "ruleType": "STRING_LENGTH"
                    }
                }
            },
            "requiredBehavior":"REQUIRED_ALWAYS" 
        } 
      }
    }
  },
  typedLinkFacets:{
    Attachment:{
        facetAttributes:{
            "TargetType":{
                attributeDefinition: {
                    "attributeType": "STRING",
                    "isImmutable":true,
                    "attributeRules": {
                        "nameLength":{ 
                            "parameters": {
                              "min":"0",
                              "max":"256" 
                            },
                            "ruleType": "STRING_LENGTH"
                        }
                    }
                },
                "requiredBehavior":"REQUIRED_ALWAYS" 
            },
            "SourceType":{
                attributeDefinition: {
                    "attributeType": "STRING",
                    "isImmutable":true,
                    "attributeRules": {
                        "nameLength":{ 
                            "parameters": {
                              "min":"0",
                              "max":"256" 
                            },
                            "ruleType": "STRING_LENGTH"
                        }
                    }
                },
                "requiredBehavior":"REQUIRED_ALWAYS" 
            }
        },
        identityAttributeOrder:["SourceType","TargetType"]
    }
  }
}

exports.types=Object.keys(exports.schema.facets).filter(x=>x!=='Root')

function attributes(schema){
    var out=_.mapValues(schema.properties,(value,key)=>{
        var copy=_.defaults({
            minLength:0,
            maxLength:256,
        },value)
        return {
            attributeDefinition: {
                "attributeType": "STRING",
                "isImmutable":!!copy.immutable,
                "attributeRules": {
                    "nameLength":{ 
                        "parameters": {
                          "min":copy.minLength.toString(),
                          "max":copy.maxLength.toString()
                        },
                        "ruleType": "STRING_LENGTH"
                    }
                }
            },
            "requiredBehavior": schema.required.includes(key)  ? "REQUIRED_ALWAYS" : "NOT_REQUIRED"
        } 
    })
    return out
}
