/*
Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Amazon Software License (the "License"). You may not use this file
except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the
License for the specific language governing permissions and limitations under the License.
*/
var query=require('query-string').stringify
var axios=require('axios')
var Url=require('url')
var sign=require('aws4').sign
var path=require('path')
var Mutex=require('async-mutex').Mutex
const mutex = new Mutex();
var aws=AWS
var reason=function(r){
    return (err)=>{ 
        console.log(err)
        Promise.reject(r)
    }
}

var endpoint=document.head.querySelector("link[rel=root]").href
var failed=false
module.exports={
    options:async function(context,href){
        var headers=await context.dispatch('_request',{
            href:href,
            method:'OPTIONS',
            returnHeaders:true
        })
        console.log(headers)
        return headers.allow.split(', ')
    },
    _request:async function(context,opts){
        var url=Url.parse(opts.href || endpoint+opts.path)
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
            var credentials=await mutex.runExclusive(async function(){
                return context.dispatch('user/getCredentials',{},{root:true})
            })
            var signed=sign(request,credentials)        
            delete request.headers["Host"]
            delete request.headers["Content-Length"]        
        
            context.commit('loading',true)
            var result=await axios(signed)
            if(opts.returnHeaders){
                return result.headers
            }else{
                return result.data
            }
        }catch(e){
            console.log(JSON.stringify(_.get(e,"response",e),null,2))
            if(e.response){
                var status=e.response.status
                if(status===403){
                    var login=_.get(context,"rootState.info._links.DesignerLogin.href")
                    if(login && !failed){
                        failed=true
                        var result=window.confirm("You need to be logged in to use this page. click ok to be redirected to the login page") 
                        if(result) window.window.location.href=login
                    }else{
                        throw e
                    }
                }else {
                    var message={
                        response:_.get(e,"response.data"),
                        status:_.get(e,"response.status")
                    }
                    if(status===404 && opts.ignore404){
                        throw "does-not-exist"
                    }else{
                        throw message
                    }
                }
            }else if(e.code==="CredentialTimeout"){
                var login=_.get(context,"rootState.info._links.DesignerLogin.href")
                if(login && !failed){
                    failed=true
                    var result=window.confirm("Your credentials have expired. Click ok to be redirected to the login page.") 
                    if(result){
                        context.dispatch('user/logout',{},{root:true})
                        window.window.location.href=login
                    }else{
                        throw e
                    }
                }
            }else{
                window.alert("Unknown Error")
                throw e
            }
        }finally{
            context.commit('loading',false)
        }
    }
}






