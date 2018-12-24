<template lang='pug'>
  v-card.ma-2
    v-card-title(primary-title)
      div
        div
          span.headline {{item.data.ID}}:
          span {{item.data.NotebookInstanceStatus}}
        span {{item.data.InstanceType}}
        span(v-if="item.data.Description") {{item.data.Description}}
    v-card-text
      v-list(three-line dense)
        v-container.pa-0
          v-layout(row  wrap)
            v-flex.xs6(v-for="(value,key) in data" :key="value")
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
      v-btn(flat 
        v-if="instance.template" 
        @click.native="state"
        :loading="updating"
        ) {{instance.template.data.prompt}}
      v-spacer
      v-btn(flat v-if="login" :href="login") login
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
      updating:false 
    }
  },
  components:{
  },
  computed:{
    login:function(){
      return _.get(
        _.find(this.item.links,x=>x.rel==="login"),
        "href")
    },
    item:function(){
      return _.get(this,"instance.items[0]",{})
    },
    data:function(){
      return _.omit(this.item.data,["ID","InstanceType","NotebookInstanceStatus"])
    }
  },
  created:function(){
  },
  methods:{
    state:function(){
      this.updating=true
      this.$store.dispatch('api/state',this.instance)
      .then(()=>{
        this.updating=false
        setTimeout(()=>this.$emit('refresh'))
      })
    }
  }
}
</script>
