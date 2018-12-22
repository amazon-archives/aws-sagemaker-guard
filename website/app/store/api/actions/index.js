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
    list:async function(context,opts){
        var result=await context.dispatch('_request_cognito',{
            url:document.head.querySelector("link[rel=webAPI]").href,
            method:'get'
        },{root:true})
        
        var href=result.collection.items
            .filter(x=>x.name===opts.type)[0]
            .href
        context.commit('root',result)

        console.log(result)
        var data=await context.dispatch('_request_cognito',{
            url:href,
            method:'get'
        },{root:true})
        await Promise.all(data.collection.items.map(async x=>{
            result=await context.dispatch('_request_cognito',{
                url:x.href,
                method:'get'
            },{root:true})
            Object.assign(x,result.collection)
        }))
        console.log(data)
        context.commit('collection',{type:opts.type,val:data})
    },
    get:async function(context,opts){
        var result=await context.dispatch('_request_cognito',{
            url:opts.href,
            method:'get'
        },{root:true})
        return result.collection.items[0]
    },
    state:async function(context,opts){
        var result=await context.dispatch('_request_cognito',{
            url:opts.href,
            method:'POST',
            body:JSON.stringify({
                state:opts.template.data.schema.properties.state.enum[0]
            })
        },{root:true})
        return result.collection.items[0]
    },
}






