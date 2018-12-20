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
var path=require('path')

var reason=function(r){
    return (err)=>{ 
        console.log(err)
        Promise.reject(r)
    }
}

var failed=false
module.exports={
    init:async function(context,opts){
        var result=await context.dispatch('_request',{
            url:document.head.querySelector("link[rel=root]").href,
            method:'get'
        })
        context.commit('init',result.collection)
    },
    list:async function(context,opts){
        var result=await context.dispatch('_request',{
            url:document.head.querySelector("link[rel=root]").href,
            method:'get'
        })
        console.log(result)
        var instance_href=result.collection.items
            .filter(x=>x.title==="instances")[0]
            .href

        var data=await context.dispatch('_request',{
            url:instance_href,
            method:'get'
        })
        await Promise.all(data.collection.items.map(async x=>{
            result=await context.dispatch('_request',{
                url:x.href,
                method:'get'
            })
            Object.assign(x,result.collection)
            console.log(result)
        }))
        context.commit('instances',data)
    },
    get:async function(context,opts){
        var result=await context.dispatch('_request',{
            url:opts.href,
            method:'get'
        })
        return result.collection.items[0]
    },
    state:async function(context,opts){
        var result=await context.dispatch('_request',{
            url:opts.href,
            method:'POST',
            body:JSON.stringify({
                state:opts.template.data.schema.properties.state.enum[0]
            })
        })
        return result.collection.items[0]
    },
    _request:async function(context,opts){
        var url=Url.parse(opts.url)
        var request={
            host:url.hostname,
            method:opts.method.toUpperCase(),
            url:url.href,
            path:url.path,
            headers:opts.headers || {}
        }
        request.headers.Authorization=context.rootState.user.id_token
    	if(opts.body){
            request.body=JSON.stringify(opts.body),
            request.data=opts.body,
            request.headers['content-type']='application/json'
        }    
        try{
            context.commit('loading',true)
            var result=await axios(request)
            return result.data
        }catch(e){
            console.log(JSON.stringify(_.get(e,"response",e),null,2))
            window.alert("Request Error:"+e.message)
        }finally{
            context.commit('loading',false)
        }
    }
}






