module.exports={
    "MessagesTable":{
        "Type": "AWS::DynamoDB::Table",
        "Properties": {
            AttributeDefinitions:[{
                AttributeName:"Requestor",
                AttributeType:"S"
            },{
                AttributeName:"ID",
                AttributeType:"S"
            }],
            KeySchema:[{
                AttributeName:"Requestor",
                KeyType:"HASH",
            },{
                AttributeName:"ID",
                KeyType:"RANGE",
            }],
            ProvisionedThroughput:{
                ReadCapacityUnits:5,
                WriteCapacityUnits:5
            }
        }
    }
}
