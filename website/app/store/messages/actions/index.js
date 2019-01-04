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
        context.commit('clear')

        var result=await context.dispatch('_request_cognito',{
            url:opts.root,
            method:'get'
        },{root:true})
        console.log(result,opts)
        await Promise.all(result.collection.links.map(async x=>{
            var data=await context.dispatch('_request_cognito',{
                url:x.href,
                method:'get'
            },{root:true})
            Object.assign(x,data.collection)
        }))
        
        context.commit('collection',result)
    },
    get:async function(context,opts){
        var result=await context.dispatch('_request_cognito',{
            url:opts.href,
            method:'get'
        },{root:true})
        return result.collection.items[0]
    }
}






