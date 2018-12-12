var _=require('lodash')

module.exports={
    "LoginsIndex":{
        "Type": "Custom::ESProxy",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["QNA","Outputs.CFNESProxyLambda"] },
            "NoUpdate":true,
            "create":{
                endpoint:{ "Fn::GetAtt" : ["QNA","Outputs.ElasticsearchEndpoint"] },
                path:{"Fn::Sub":"/logins"},
                method:"PUT",
                body:{"Fn::Sub":JSON.stringify({ 
                    settings:{},
                    mappings:{
                        login:{
                            properties:{
                                UserName:{type:"keyword"},
                                InstanceName:{type:"keyword"},
                                "Date":{type:"date"},
                                IP:{type:"ip"},
                                RequestId:{type:"keyword"},
                                UserAgent:{type:"text"}
                            }
                        }
                    }
                })}
            },
            "delete":{
                endpoint:{ "Fn::GetAtt" : ["QNA","Outputs.ElasticsearchEndpoint"] },
                path:{"Fn::Sub":"/logins"},
                method:"DELETE"
            }
        }
    },
    "KibanaConfig":{
        "Type": "Custom::ESProxy",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["QNA","Outputs.CFNESProxyLambda"] },
            "create":{
                endpoint:{ "Fn::GetAtt" : ["QNA","Outputs.ElasticsearchEndpoint"] },
                path:{"Fn::Sub":"_bulk"},
                method:"POST",
                body:_.flatten(_.flatten([
                    require('./kibana/config'),
                    require('./kibana/Dashboards')
                ]).map(x=>[
                    {"index":{"_index":x._index,"_type":x._type,"_id":x._id}},
                    x._source
                ]))
            }
        }
    }
}

