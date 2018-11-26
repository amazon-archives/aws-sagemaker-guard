<template lang='pug'>
  v-container(fluid grid-list-lg)
    v-layout( column )
      v-flex(xs-12)
        v-card
          v-card-title 
            h2 {{type}}
          v-card-text
            v-layout(row)
              v-flex(xs10)
                query(v-for="query in queries" 
                  :query="query"
                  @query="Query(query)"
                )
              v-flex
                temp( 
                  :template="collection.collection.template"
                  :href="collection.href"
                  @refresh="refresh"
                )
              v-flex
                v-btn(@click.native="refresh") refresh
      v-flex(xs-12 v-if="loading")
        v-progress-linear(indeterminate)
      v-flex(xs-12 v-for="(item,index) in collection.collection.items")
        Item( :item="item" v-on:remove="remove(index)")
      v-flex(xs-12)
        v-container(fluid grid-list-lg)
          v-layout( row )
            v-flex(xs-6 v-if="prev")
              v-btn(block @click.native="get(prev)" ) previous
            v-flex(xs-6 v-if="next")
              v-btn(block @click.native="get(next)" ) next
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
  props:['type'],  
  data:function(){
    return {
      loading:false   
    }
  },
  watch:{
    type:function(){
      this.refresh()
    }
  },
  components:{
    query:require('./query.vue'),
    temp:require('./template.vue'),
    Item:require('./item.vue')
  },
  computed:{
    next:function(){
      return _.find(this.collection.collection.links,x=>x.rel==="next")
    },
    prev:function(){
      return _.find(this.collection.collection.links,x=>x.rel==="prev")
    },
    queries:function(){
      return this.collection.collection.queries
    },
    collection:function(){
      return _.get(_.get(this,"$store.state.data.links.items",[])
        .filter(x=>x.name===this.type),0)
    }
  },
  created:async function(){
    var self=this
    console.log("mark")
    this.loading=true
    this.refresh()
  },
  methods:{
    remove:function(index){
      this.collection.collection.items.splice(index,1)
    },
    Query:async function(query){
      this.loading=true
      try{
        this.collection.collection.items=[]
        var collection=await this.$store.dispatch('data/query',query)
        this.collection.collection=collection.collection
      }catch(e){
        console.log(e)
        window.alert(JSON.stringify(JSON.parse(e.response.collection.error),null,2))
      }finally{
        this.loading=false
      }
    },
    refresh:async function(opts){
      this.loading=true
      try{
        this.collection.collection.items=[]
        await this.$store.dispatch('data/init')
      }catch(e){
        window.alert(JSON.stringify(JSON.parse(e.response.collection.error),null,2))
      }finally{
        this.loading=false
      }
    },
    get:async function(opts){
      this.loading=true
      try{
        this.collection.collection.items=[]
        var collection=await this.$store.dispatch('data/get',opts)
        this.collection.collection=collection.collection
      }catch(e){
        console.log(e)
        window.alert(JSON.stringify(JSON.parse(e.response.collection.error),null,2))
      }finally{
        this.loading=false
      }
    }
  }
}
</script>
