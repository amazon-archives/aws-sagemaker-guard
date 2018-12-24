<template lang='pug'>
  div 
    v-card
      v-card-title(primary-title)
        h2 {{data.title}}
      v-card-text
        v-progress-linear(v-if="loading" indeterminate)
        v-radio-group( v-model="selected" v-if="messageTypes.length>1")
          v-radio( v-for="messageType in messageTypes"
            :key="messageType.title"
            :label="messageType.title"
            :value="messageType.title"
          )
        p {{data.description}}
      v-card-actions
        v-spacer
        temp( 
          v-if="ifTemplate"
          :template="template"
          :href="template.href"
          auth="cognito"
          @new="add"
        )
        v-btn(@click="refresh") Refresh
    v-container(fluid grid-list-md)
      v-layout(column justify-center)
        v-flex(xs12 v-for="(item,index) in items" :key="item.href")
          message( 
            :item="item" 
            :key="item.href"
            :index="index"
            v-on:remove="remove(index)"
          )
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
      open:false,
      selected:""
  }},
  components:{
    message:require('./message.vue'),
    temp:require('./template.vue')
  },
  computed:{
    root:function(){
      return _.get(this,"$store.state.route.query.href",[])
    },
    messageTypes:function(){
      return _.get(this,"$store.state.messages.messages.links",[])
        .filter(x=>x.rel==="collection")
    },
    items:function(){
      return _.get(this,"messages.links",[])
    },
    data:function(){
      return _.get(this,"messages.items[0].data",{})
    },
    ifTemplate:function(){
      return !_.isEmpty(this.template)
    },
    template:function(){
      return _.get(this,"messages.template")
    },
    messages:function(){
      return this.messageTypes.filter(x=>x.title===this.selected)[0]
    }
  },
  created:function(){
    this.loading=true
    this.$store.dispatch('messages/list',{
      root:this.root
    })
    .then(()=>this.selected=this.messageTypes[0].title)
    .catch(e=>{
      console.log(e)
    })
    .then(()=>this.loading=false)
  },
  methods:{
    add:function(x){
      this.messages.items.unshift(x)
    },
    refresh:function(){
      this.loading=true
      this.$store.dispatch('messages/list',{
        root:this.root
      })
      .catch(console.log)
      .then(()=>this.loading=false)
    },
    remove:function(index){
      this.$delete(this.items,index)
    }
  }
}
</script>

<style lang='scss' scoped>
  #workspace {
    margin-top:60px;
  }
</style>

