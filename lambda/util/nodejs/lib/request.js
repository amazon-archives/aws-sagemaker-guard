/*
Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Amazon Software License (the "License"). You may not use this file
except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the
License for the specific language governing permissions and limitations under the License.
*/
var axios=require('axios')
var Url=require('url')
var sign=require('aws4').sign
var aws=require('aws-sdk')
    
exports.send=function(opts){
    var url=Url.parse(opts.href)
    var request={
        host:url.hostname,
        method:opts.method.toUpperCase(),
        url:url.href,
        path:url.path,
        headers:opts.headers || {}
    }
    if(opts.body){
        request.body=JSON.stringify(opts.body),
        request.data=opts.body,
        request.headers['content-type']='application/json'
    }
    try{
        var signed=sign(request,aws.credentials)        
        delete request.headers["Host"]
        delete request.headers["Content-Length"]        
    
        return axios(signed)
        .then(result=>{
            if(opts.returnHeaders){
                return result.headers
            }else{
                return result.data
            }
        })
    }catch(e){
        console.log(e) 
        throw e
    }
}






