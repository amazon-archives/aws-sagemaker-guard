<template lang='pug'>
  span
    v-card.ml-4.mr-4(v-if="!loading")
      v-card-title
        v-btn(flat icon @click.native="show=!show")
          v-icon {{ show ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}
        h3(@click.native="show=!show") {{data.DisplayName || ID}}
        v-spacer
        v-btn(flat icon 
          @click.native="remove" 
          :loading="removing"
          v-if="allow.includes('DELETE')"
        ) 
          v-icon() delete
      v-slide-y-transition
        v-card-text(v-if="show")
          v-list(three-line dense)
            v-container.pa-0
              v-layout(row  wrap)
                v-flex.xs6(v-for="(value,key) in data" )
                  v-list-tile
                    v-list-tile-content
                      v-list-tile-title {{key}} 
                      v-list-tile-sub-title {{value}} 
                v-flex.xs6(v-for="link in links" )
                  v-list-tile( v-for="link in links")
                    v-list-tile-content
                      v-list-tile-title {{link.title}}
                      v-list-tile-sub-title
                        a(:href="link.href" target="_blank") Go To
          v-container.pa-0
            v-layout
              v-spacer
              temp(
                v-if="allow.includes('PUT') && collection.template"
                :template="collection.template"
                :href="item.href"
                method="PUT"
              )
          v-container.pa-0
            v-layout(column)
              attachment(v-for="attachment in children" :data="attachment")
              attachment(v-for="attachment in parents" :data="attachment")
    v-card.ml-4.mr-4(v-if="loading")
      v-progress-linear(indeterminate)
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
  props:['item'],  
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
    attachment:require('./attachment.vue'),
  },
  computed:{
    ID:function(){
      return _.get(this,'collection.items[0].data.ID')
    },
    links:function(){
      return _.get(this,"collection.items[0].links",[])
        .filter(x=>x.rel==="info")
    },
    parents:function(){
      return _.get(this,"collection.items[0].links",[])
        .filter(x=>x.rel==="parent")
    },
    children:function(){
      return _.get(this,"collection.items[0].links",[])
        .filter(x=>x.rel==="child")
    },
    data:function(){
      return _.omit(
        _.get(this,'collection.items[0].data',{}),
        ["ID"]
      )
    }
  },
  created:async function(){
    this.loading=true
    try{
      var data=await this.$store.dispatch('data/get',this.item)
      Vue.set(this,"collection",data.collection)
      this.allow=await this.$store.dispatch('options',this.item.href)
    }catch(e){
      console.log(e)
    }finally{
      this.loading=false
    }
  },
  methods:{
    remove:async function(){
      this.removing=true
      try{
        await Promise.join(
          new Promise(resolve => setTimeout(resolve, 300)),
          this.$store.dispatch('data/rm',this.item)
        )
        this.$emit("remove")
      }catch(e){
        console.error(e)
        window.alert(JSON.stringify(JSON.parse(e.response.collection.error),null,2))
      }finally{
        this.removing=false
      }
    }
  }
}
</script>
