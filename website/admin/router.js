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
    base:'/',
    routes:[
        {   path:'/loading',
            component:require('./components/loading.vue')
        },
        {
            name:'error',
            path:'/error',
            component:require('./components/error.vue'),
            props:true
        },
        {
            path:'/home',
            name:"home",
            component:require('./components/home.vue'),
            params:false
        },
        {
            path:'/home/:type?/:id?',
            name:"page",
            component:require('./components/page.vue'),
            props:true
        }
    ]
}

