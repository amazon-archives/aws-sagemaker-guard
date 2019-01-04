<template lang='pug'>
  v-card.ma-2
    v-progress-linear(v-if="loading" indeterminate)
    v-card-title(primary-title v-if="!loading")
      v-btn.primary--text(flat icon @click.native="show=!show")
        v-icon(color="primary") {{ show ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}
      v-icon.pr-3.error--text(v-if="data.Status.toLowerCase()==='deny'") error
      v-icon.pr-3.success--text(v-if="data.Status.toLowerCase()==='approve'") check_circle
      v-icon.pr-3(v-if="data.Status.toLowerCase()==='pending'") hourglass_empty
      h3(@click.native="show=!show") {{title}}
      v-spacer
      rm(
        @click="remove(index)" 
        :loading="removing"
        v-if="allow.includes('DELETE')"
      ) 
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
              method="PUT"
              :href="template.href"
              @new="refresh"
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
    temp:require('./template.vue'),
    rm:require('./delete.vue')
  },
  computed:{
    title:function(){
      return this.data.Requestor ? 
        `${this.data.Requestor}: ${this.data.InstanceType || this.data.Status}`:
        `${this.data.InstanceType}: ${this.data.Status}`
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
    refresh:function(){
      this.$emit("refresh")
    },
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
