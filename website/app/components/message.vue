<template lang='pug'>
  v-card.ma-2
    v-progress-linear(v-if="loading" indeterminate)
    v-card-title(primary-title v-if="!loading")
      v-btn(flat icon @click.native="show=!show")
        v-icon(color="primary") {{ show ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}
      h3(@click.native="show=!show") {{title}}
      v-spacer
      v-btn(flat icon 
        @click.native="remove(index)" 
        :loading="removing"
        v-if="allow.includes('DELETE')"
      ) 
        v-icon() delete
    v-slide-y-transition
      v-card-text(v-if="show && !loading")
        v-card-text
          h4 Description
          p(v-if="data.Description") {{data.Description}}
          v-divider
          h4 Information
          v-progress-linear(v-if="loading" indeterminate)
          v-list(two-line dense)
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
                        :key="v"
                      ) {{v}}
        v-card-actions
          v-spacer
          temp( 
              v-if="schema"
              :template="template"
              :href="template.href"
              auth="cognito"
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
  props:["item","index"],
  data:function(){
    return {
      updating:false,
      loading:false,
      removing:false,
      show:false,
      allow:[],
      collection:{}
    }
  },
  components:{
    temp:require('./template.vue')
  },
  computed:{
    title:function(){
      return this.data.Requestor ? 
        `${this.data.Requestor}: ${this.data.InstanceType}`:
        `${this.data.InstanceType}: ${this.data.response}`
    },
    data:function(){
      return _.get(this,'collection.items[0]',{})
    },
    template:function(){
      return _.get(this,'collection.template')
    },
    schema:function(){
      return _.get(this,'collection.template.data.schema')
    }
  },
  created:function(){
    this.loading=true
    this.$store.dispatch('get',Object.assign(this.item,{auth:"cognito"}))
    .then(x=>{
      Vue.set(this,"collection",x)
      return this.getOptions()
    })
    .catch(console.log)
    .then(()=>this.loading=false)
  },
  methods:{
    getOptions:function(){
      this.$store.dispatch("options",{
        auth:"cognito",
        href:this.collection.href
      })
      .then(x=>this.allow=x)
    },   
    remove:function(index){
      this.removing=true
      this.$store.dispatch("rm",{
        auth:"cognito",
        href:this.collection.href
      })
      .then(()=>this.$emit("remove",index))
      .catch(console.log)
      .then(()=>this.removing=false)
    }
  }
}
</script>
