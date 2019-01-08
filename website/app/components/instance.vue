<template lang='pug'>
  v-card.ma-2
    v-card-title(v-if="loading")
      v-progress-linear(indeterminate)
    v-card-title(primary-title v-if="!loading")
      div(v-if="data")
        div
          v-icon.pr-3(v-if="data.status==='busy'") hourglass_empty
          span.headline {{data.ID}}
          span(v-if="data.status==='ready'") : {{data.state}}
        span {{data.InstanceType}}
        span(v-if="data.Description") {{data.Description}}
    v-card-text(v-if="display")
      v-list(three-line dense)
        v-container.pa-0
          v-layout(row  wrap)
            v-flex.xs6(v-for="(value,key) in display" :key="JSON.stringify(value)")
              v-list-tile
                v-list-tile-content
                  v-list-tile-title {{key}} 
                  v-list-tile-sub-title(v-if="!Array.isArray(value)") {{value}} 
                  v-list-tile-sub-title(
                    v-if="Array.isArray(value)"
                    v-for="v in value"
                    :key="JSON.stringify(v)"
                  ) {{v}}
    v-card-actions
      v-btn.primary--text(flat 
        v-if="item.template" 
        @click.native="state"
        :loading="updating"
        ) {{item.template.data.prompt}}
      v-spacer
      v-btn.primary--text(flat v-if="login" :href="login") login
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
  props:["instance"],
  data:function(){
    return {
      updating:false,
      loading:false,
      item:{}
    }
  },
  components:{
  },
  computed:{
    login:function(){
      return _.get(
        _.find(_.get(this,"item.items[0].links",[]),x=>x.rel==="login"),
        "href")
    },
    display:function(){
      var out=_.omit(this.data,["ID","InstanceType","NotebookInstanceStatus","state","status"])
      if(_.keys(out).length){
        return out
      }else{
        return false
      }
    },
    data:function(){
      return _.get(this,"item.items[0].data",{})
    }
  },
  created:async function(){
    this.refresh()
  },
  methods:{
    load:async function(){
        var data=await this.$store.dispatch('api/get',this.instance)
        this.$set(this,"item",data)
        if(this.data.status==="busy"){
          setTimeout(()=>this.load(),5000)
        }
    },
    refresh:async function(){
      this.loading=true
      try{
        await this.load()
        this.loading=false
      }catch(e){
        this.loading=false
        throw e
      }
    },
    state:function(){
      this.updating=true
      this.$store.dispatch('api/state',this.item)
      .then(()=>{
        return this.refresh()
      })
      .catch(e=>{
        console.log(e) 
      })
      .then(()=>{
        this.updating=false
      })
    }
  }
}
</script>
