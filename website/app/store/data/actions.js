/*
Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Amazon Software License (the "License"). You may not use this file
except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the
License for the specific language governing permissions and limitations under the License.
*/
module.exports={
    query:async function(context,opts){
        var query=opts.data
        .filter(x=>x.value)
        .map(x=>`${encodeURIComponent(x.name)}=${encodeURIComponent(x.value)}`)
        .join('&')

        return await context.dispatch('_request',{
            href:`${opts.href}${query}`,
            method:'GET'
        },{root:true})
    },
    rm:async function(context,opts){
        return await context.dispatch('_request',{
            href:opts.href,
            method:'DELETE'
        },{root:true})
    },
    get:async function(context,opts){
        return await context.dispatch('_request',{
            href:opts.href,
            method:'GET'
        },{root:true})
    },
    
    api:_.once(async function(context,opts){
        var data=await context.dispatch('_request',{
            path:'/',
            method:'get'
        },{root:true})
        console.log(data)
        var info=_.fromPairs(data.collection.items[0].data.map(x=>[x.name,x.value]))
        context.commit('info',info)
        var api=data.collection.items[0].links
            .filter(x=>x.rel==='api')[0]
            .href
        
        return await context.dispatch('_request',{
            href:api,
            method:'get'
        },{root:true})
    }),
    init:async function(context,opts){
        var root=await context.dispatch('api')

        await Promise.all(
            root.collection.items
            .filter(x=>x.rel==="collection")
            .map(async x=>{
                x.method='get'
                var result=await context.dispatch('_request',x,{root:true})
                Object.assign(x,result)
            })
        )
        context.commit('collection',root.collection)
    }
}






