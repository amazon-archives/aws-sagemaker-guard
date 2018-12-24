<template lang='pug'>
  div
    v-card.ma-2
      v-card-title(primary-title) 
        h2 {{data.title}}
      v-card-text
        p {{data.description}}
      v-card-text(v-if="loading")
        v-progress-linear(v-if="loading" indeterminate)
    v-container(fluid grid-list-md v-if="!loading")
      v-layout(row wrap v-for="instance in instances" :key="instance.href")
        v-flex(xs8 offset-xs2)
          instance(@refresh="refresh" :instance="instance")
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
  props:["type"],
  data:()=>{
    return {
      loading:false,
      open:false
  }},
  components:{
    instance:require('./instance.vue') 
  },
  computed:{
    loginUrl:function(){
      return document.head.querySelector("link[rel=login]").href
    },
    instances:function(){
      return _.get(this,"$store.state.api.instances.links",[])
        .filter(x=>x.rel==="item")
    },
    data:function(){
      return _.get(this,"$store.state.api.instances.items[0].data",{})
    }
  },
  created:function(){
    this.loading=true
    this.$store.dispatch('api/list',{
      type:"instances"
    })
    .then(()=>this.loading=false)
    .then(()=>{
      if(this.instances.length===0){
        this.$router.replace({name:"messages",query:{
          href:_.get(this,"$store.state.api.root.items",[])
            .filter(x=>x.rel==="messages")[0].href
        }})
      }
    })
    .catch(e=>{
      console.log(e)
      this.loading=false
    })
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

