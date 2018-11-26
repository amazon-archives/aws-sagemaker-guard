<template lang='pug'>
  v-text-field(
    v-model="local"
    :label="query.prompt"
    append-icon="search"
    @click:append="emit"
    @keyup="emit"
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
  props:['query'],
  data:function(){
    return {
      local:""
    }
  },
  components:{
  },
  computed:{
  },
  created:async function(){
    var self=this
    await self.$store.dispatch('data/init')
  },
  methods:{
    emit:function(){
      this.query.data
        .find(x=>x.name==="Query")
        .value=this.local
      this.$emit('query')
    }
  }
}
</script>
