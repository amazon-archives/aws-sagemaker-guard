<template lang='pug'>
  v-card.ma-2
    v-card-title(primary-title)
      v-btn(flat icon @click.native="show=!show")
        v-icon {{ show ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}
      h3(@click.native="show=!show") {{data.DisplayName || data.ID}}
      span(v-if="data.Description") {{data.Description}}: 
      v-spacer
      v-btn(flat icon 
        @click.native="remove" 
        :loading="removing"
        v-if="allow.includes('DELETE')"
      ) 
        v-icon() delete
    v-slide-y-transition
      v-card-text(v-if="show")
        v-card-text
          v-progress-linear(v-if="loading" indeterminate)
          v-list(two-line dense)
            v-container.pa-0
              v-layout(row  wrap)
                v-flex.xs6(v-for="(value,key) in data" )
                  v-list-tile
                    v-list-tile-content
                      v-list-tile-title {{key}} 
                      v-list-tile-sub-title(v-if="!Array.isArray(value)") {{value}} 
                      v-list-tile-sub-title(
                        v-if="Array.isArray(value)"
                        v-for="v in value"
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
  props:["item"],
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
    data:function(){
      return _.get(this,'collection.items[0]',{})
    },
    template:function(){
      return _.get(this,'collection.template')
    },
    schema:function(){
      return _.get(this,'collection.template.schema')
    }
  },
  created:function(){
    this.loading=true
    this.$store.dispatch('getCognito',this.item)
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
    remove:function(){}
  }
}
</script>
