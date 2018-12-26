<template lang='pug'>
  div 
    v-card
      v-card-title(primary-title)
        h2 {{data.title}}
      v-card-text
        .subheading {{data.description}}
      v-card-actions
        v-spacer
        temp( 
          v-for="template in templates"
          :template="template"
          :href="template.href"
          :key="template.href"
        )
    v-container(grid-list-sm)
      v-layout(row wrap)
        v-flex(v-if="pages.length===0")
          v-progress-linear(indeterminate) 
        v-flex.xs4(v-for="page in pages" :key="page.href")
          v-card(height="200px")
            v-card-title 
              h3 {{page.name}}
            v-card-text
              p {{page.prompt}}
            v-card-actions
              v-spacer
              v-btn.primary--text(flat :href="'#/'+page.rel+'/'+page.name+'?href'+encodeURI(page.href)") go to
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
  data:function(){
    return {}
  },
  components:{
    temp:require('./template.vue')
  },
  computed:{
    data:function(){
      return _.get(this,"$store.state.data.links.items[0].data",{})
    },
    pages:function(){
      return _.get(this,"$store.state.data.links.links",[])
        .filter(x=>x.rel==="resources")
    },
    templates:function(){
      return _.get(this,"$store.state.data.links.template",[])
    },
  },
  created:async function(){
    var self=this
    await self.$store.dispatch('data/init').catch(console.log)
  },
  methods:{
  }
}
</script>
