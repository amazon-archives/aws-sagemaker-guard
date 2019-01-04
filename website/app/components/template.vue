<template lang='pug'>
  div
    v-dialog(v-model="finished")
      v-card(v-if="!error")
        v-card-title
          h3 finished
        v-card-text
          p.success--text success
        v-card-actions
          v-spacer
          v-btn.primary--text(@click="reset") close
      v-card(v-if="error")
        v-card-title
          h3 Error: {{Error.type}}
        v-card-text
          pre.error--text {{Error}}
        v-card-actions
          v-spacer
          v-btn.primary--text(@click="reset") close
    v-dialog(v-model="loading")
      v-card
        v-card-title
          h3  loading 
        v-card-text
          v-progress-linear(indeterminate) 
    v-dialog(v-model="open")
      v-card
        v-card-title
          h2 {{template.data.prompt}}
        v-card-text
          v-progress-linear(indeterminate v-if="schema.loading") 
          v-form(v-if="!schema.loading")
            schema-input( 
              v-model="local"
              :valid.sync="valid"
              :schema="schema.template"
              :pick="required"
              path="add"
            )
          v-expansion-panel.elevation-0(v-if="!schema.loading && optional.length>0")
            v-expansion-panel-content( style="display:block")
              v-divider
              div( slot="header") 
                h4 Advanced
              v-form
                schema-input( 
                  v-model="local"
                  :valid.sync="valid"
                  :schema="schema.template"
                  :omit="required"
                  path="add"
                )
        v-card-actions
          v-spacer
          v-btn.primary--text(flat @click="submit") Submit
          v-btn.primary--text(flat @click="open=false") Cancel
    v-btn.ml-2.mr-2.primary--text( 
      @click="open=!open"
      flat
    ) {{template.data.prompt}}
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
var empty=require('./empty')

module.exports={
  props:['template','href','method',"auth"],
  data:function(){
    return {
      open:false,
      loading:false,
      finished:false,
      valid:true,
      error:null,
      local:{},
      schema:{
        loading:true,
        template:{}
      }
    }
  },
  components:{
    schemaInput:require('./input.vue'),
  },
  computed:{
    Error:function(){
      try{
        return JSON.stringify(JSON.parse(this.error),null,2)
      }catch(e){
        return this.error
      }
    },
    required:function(){
      if(_.get(this,'schema.template.required')){
        return _.get(this,'schema.template.required',[])
      }else{
        return Object.keys(_.get(this,'schema.template.properties',{}))
      }
    },
    optional:function(){
      return Object.keys(_.get(this,"schema.template.properties",{}))
        .filter(x=>!this.required.includes(x))
    },
    request:function(){
      return this.auth==="cognito" ? "_request_cognito" : "_request"
    }
  },
  created:async function(){
    this.load()
  },
  watch:{
    template:function(){
      this.load()
    }
  },
  methods:{
    load:async function(){
      var self=this
      if(_.get(this,"template.data.schema.href")){
          var result=await this.$store.dispatch(this.request,{
            href:this.template.data.schema.href,
            method:"get"
          })
          Vue.set(this.schema,"template",
            result.collection.template.data.schema)
          this.refresh()
      }else{
        this.schema.template=this.template.data.schema
        this.refresh()
      }
      this.schema.loading=false
    },
    reset:function(){
      this.open=false
      this.loading=false
      this.finished=false
      this.error=false
    },
    refresh:function(){
      this.local=defaultFromSchema(this.schema.template)
    },
    submit:async function(){
      this.loading=true 
      this.open=false
      try{
        var result=await this.$store.dispatch('create',{
          href:this.href,      
          body:{
            template:{data:clean(this.local)}
          },
          method:this.method || "POST",
          request:this.request
        })
        this.refresh()
        this.$emit("new",result)
      }catch(e){
        console.log(e)
        this.error=_.get(e,"response.collection.error",e)
      }finally{
        this.finished=true
        this.loading=false
        this.$emit('refresh')
      }
    }
  }
}
function clean(obj){
  if(Array.isArray(obj)){
      for( var i=0; i<obj.length; i++){
          obj[i]=clean(obj[i])
      }
      obj=_.compact(obj)
      return obj.length ? obj : false
  } else if(typeof obj==="object"){
      for (var key in obj){
          obj[key]=clean(obj[key])
      }
      return _.pickBy(obj)
  }else if(obj.trim){
      return obj.trim()
  }else{
      return obj 
  }
}
function defaultFromSchema(obj){
    if(obj.type==="object"){
        return _.mapValues(obj.properties,defaultFromSchema)
    }else if(obj.type==="array"){
        return [defaultFromSchema(obj.items)]
    }else if(obj.type==="string"){
        return obj.default || ""
    }else if(obj.type==="number"){
        return obj.default || 0
    }
}
</script>
