var _=require('lodash')

module.exports=Object.assign({
"DevSchema":{
    "Type": "Custom::CloudDirectorySchema",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNCloudDirectorySchemaLambda", "Arn"] },
        "Schema":JSON.stringify(require('./schema').schema),
        "Name":{"Fn::Sub":"schema-${AWS::StackName}"}
    }
},
"PubSchema":{
    "Type": "Custom::CloudDirectoryPublishedSchema",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNCloudDirectoryPublishSchemaLambda", "Arn"] },
        "DevelopmentSchemaArn":{"Ref":"DevSchema"},
        "Version":"1"
    }
},
"Directory":{
    "Type": "Custom::CloudDirectoryDirectory",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNCloudDirectoryDirectoryLambda", "Arn"] },
        "SchemaArn":{"Ref":"PubSchema"},
        "Name":{"Ref":"AWS::StackName"}
    }
},
"RootIndex":{
    "Type": "Custom::CloudDirectoryObject",
    "Properties": {
        "ServiceToken": { "Fn::GetAtt" : ["CFNCloudDirectoryObjectLambda", "Arn"] },
		DirectoryArn:{"Fn::GetAtt":["Directory","DirectoryArn"]}, 
		SchemaFacets: [ {
		    FacetName: 'Root',
		    SchemaArn: {"Fn::GetAtt":["Directory","AppliedSchemaArn"]}
		}],
		LinkName: 'index',
		ObjectAttributeList: [{
            Key: { 
                FacetName: 'Root',
                Name: 'Type', 
                SchemaArn: {"Fn::GetAtt":["Directory","AppliedSchemaArn"]}
            },
            Value: { 
                StringValue: 'index'
            }
		}],
		ParentReference: {
		    Selector:"/"
		}    
    }
}},
catagory("users"),
catagory("groups"),
catagory("instances")
)

function catagory(name){
    return _.mapKeys({
    "Root":{
        "Type": "Custom::CloudDirectoryObject",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNCloudDirectoryObjectLambda", "Arn"] },
            DirectoryArn:{"Fn::GetAtt":["Directory","DirectoryArn"]}, 
            SchemaFacets: [ {
                FacetName: 'Root',
                SchemaArn: {"Fn::GetAtt":["Directory","AppliedSchemaArn"]}
            }],
            LinkName:name,
            ObjectAttributeList: [{
                Key: { 
                    FacetName: 'Root',
                    Name: 'Type', 
                    SchemaArn: {"Fn::GetAtt":["Directory","AppliedSchemaArn"]}
                },
                Value: { 
                    StringValue:name
                }
            }],
            ParentReference: {
                Selector:"/"
            }    
        }
    },
    "Index":{
        "Type": "Custom::CloudDirIndex",
        "DependsOn":[`RootIndex`],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNCloudDirectoryIndexLambda", "Arn"] },
            DirectoryArn:{"Fn::GetAtt":["Directory","DirectoryArn"]}, 
            LinkName:name,
            ParentReference: {
                Selector:`/index`
            },
            IsUnique: true, 
            OrderedIndexedAttributeList: [{
                FacetName:name, 
                Name: 'ID', 
                SchemaArn: {"Fn::GetAtt":["Directory","AppliedSchemaArn"]}
            }]
        }
    }},(val,key)=>`${name}${key}`)
}
