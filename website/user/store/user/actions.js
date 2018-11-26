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
var jwt=require('jsonwebtoken')
var aws=AWS
var set=Vue.set
var query=require('query-string')

module.exports={
    logout:function(context){
        window.sessionStorage.clear()
        var login=document.head.querySelector("link[rel=Login]").href
        console.log(login)
        window.location=login
    },
    login:function(context){
        aws.config.region=document.head.querySelector("[name=Region]").content
        
        var id_token=window.sessionStorage.getItem('id_token')
        var access_token=window.sessionStorage.getItem('access_token')
        
        if(!id_token){
            var hash=window.location.hash.slice(1)
            var id_token=query.parse(hash).id_token
            var access_token=query.parse(hash).access_token
            if(!id_token) context.dispatch('logout')
        }

        var token=jwt.decode(id_token)
        set(context.state,'id_token',id_token)
        set(context.state,'token',token)
        window.sessionStorage.setItem('id_token',id_token)
        window.sessionStorage.setItem('access_token',access_token)
        
        set(context.state,'name',token["cognito:username"])
        set(context.state,'loggedin',true)
    }
}

