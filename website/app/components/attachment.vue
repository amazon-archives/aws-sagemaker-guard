<template lang='pug'>
  div
    div
      h3 {{data.title}}
    div(v-if="loading")
      v-progress-linear(indeterminate)
    div(v-if="!loading")
      v-list(v-if="items.length===0")
        v-list-tile
          v-list-tile-content
            v-list-tile-title empty
      v-list(one-line v-if="items.length > 0")
        v-list-tile(v-for="(item,index) in items" :key="item.href")
          v-list-tile-action
            v-btn.primary--text(v-if="!loading && item.rel==='attachment'" @click.native="remove(item,index)" flat icon)
              v-icon() clear
            v-progress-circular(v-if="loading" indeterminate color="primary")
          v-list-tile-content
            v-list-tile-title {{item.data.ID}}
      v-layout(row)
        v-flex(xs10)
          query(v-for="query in collection.queries" 
            :query="query"
            :key="query.href"
            @query="Query(query)"
          )
        v-flex
          temp( 
            :template="collection.template"
            :href="collection.href"
            @refresh="refresh"
          )
        v-flex
          v-btn.primary--text(flat @click.native="refresh") refresh

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
  props:['data'],  
  data:function(){
    return {
      collection:{},
      show:false,
      removing:false,
      loading:false,
      allow:[]
    }
  },
  components:{
    temp:require('./template.vue'),
    query:require('./query.vue'),
  },
  computed:{
    empty:function(){
      return _.get(this,"collection.items",[]).length<1
    },
    items:function(){
      return _.get(this,"collection.items",[])
    }
  },
  created:async function(){
    await this.refresh()
  },
  methods:{
    refresh:async function(opts){
      this.loading=true
      try{
        this.collection.items=[]
        var data=await this.$store.dispatch('get',this.data)
        Vue.set(this,"collection",data)
        await this.load()
      }catch(e){
        console.log(e)
        window.alert(JSON.stringify(JSON.parse(e.response.collection.error),null,2))
      }finally{
        this.loading=false
      }
    },
    Query:async function(query){
      this.loading=true
      try{
        this.collection.items=[]
        var collection=await this.$store.dispatch('data/query',query)
        await this.load()
        this.collection=collection.collection
      }catch(e){
        console.log(e)
        window.alert(JSON.stringify(JSON.parse(e.response.collection.error),null,2))
      }finally{
        this.loading=false
      }
    },
    load:async function(){
      var self=this
      await Promise.all(this.collection.items
        .map(async (x,i)=>{
          var data=await self.$store.dispatch('get',x)
          console.log(data)
          result=Object.assign(
            data.items[0],
            x)
          x=result
          self.collection.items[i]=x
        }))
    },
    remove:async function(item,index){
      await this.$store.dispatch('rm',Object.assign(item,{auth:"aws"}))
      this.collection.items.splice(index,1)
    }
  }
}
</script>
