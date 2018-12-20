/*
Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Amazon Software License (the "License"). You may not use this file
except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the
License for the specific language governing permissions and limitations under the License.
*/
var query=require('query-string')
var jwt=require('jsonwebtoken')
var set=Vue.set
var aws=AWS

module.exports={
    credentials:function(state,payload){
        set(state,'loggedin',true)
        set(state,'credentials',payload)
    },
    login(state){
        state.loggedIn=true
    },
    setId(state,Id){
        state.Id=Id
    }
}
