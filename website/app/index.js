/*
Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Amazon Software License (the "License"). You may not use this file
except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the
License for the specific language governing permissions and limitations under the License.
*/

var sync=require('vuex-router-sync').sync
import IdleVue from 'idle-vue'

Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(Vuetify)


document.addEventListener('DOMContentLoaded',init)

function init(){
    var router=new VueRouter(require('./router'))
    var store=new Vuex.Store(require('./store'))
    sync(store,router)
    router.replace('/loading')
    
    Vue.use(IdleVue, {
        idleTime: 45*60*1000,
        eventEmitter:new Vue(),
        store:store,
        startAtIdle:false
    })
    
    var app=require('./app.vue')
    var App=new Vue({
        router,
        store,
        render:h=>h(app)
    })
    
    router.onReady(()=>App.$mount('#App'))
}
