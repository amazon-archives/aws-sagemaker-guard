<template lang='pug'>
  v-app
    v-toolbar
      v-toolbar-title SageGuard Instance Access
      v-spacer
      v-toolbar-items
        v-btn( @click="refresh") refresh
        v-btn( @click="logout") Logout
    v-container(fluid grid-list-md v-if="!loading")
      v-layout(row wrap v-for="instance in instances" )
        v-flex(xs6 offset-xs3)
          instance(@refresh="refresh" :instance="instance")
    v-container(v-if="loading")
        v-flex(xs6 offset-xs3)
          v-progress-linear( indeterminate)
</template>

<script>
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
  data:()=>{
    return {
      loading:false
  }},
  components:{
    instance:require('./components/instance.vue') 
  },
  computed:{
    loginUrl:function(){
      return document.head.querySelector("link[rel=login]").href
    },
    instances:function(){
      return _.get(this,"$store.state.api.instances",[])
    }
  },
  created:function(){
    this.loading=true
    this.$store.dispatch('user/login') 
    this.$store.dispatch('api/list')
      .then(()=>this.loading=false)
      .catch(()=>this.loading=false)
  },
  methods:{
    logout:function(){
      this.$store.dispatch('user/logout')
      window.location=this.loginUrl
    },
    refresh:function(){
      this.loading=true
      this.$store.dispatch('api/list')
        .then(()=>this.loading=false)
        .catch(()=>this.loading=false)
    }
  },
  onIdle:function(){
    window.alert("Sorry, you are being logged out for being idle. Please log back in")
    this.logout()
  }
}
</script>

<style lang='scss' scoped>
  #workspace {
    margin-top:60px;
  }
</style>

