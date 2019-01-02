<template lang='pug'>
  div
    v-dialog(v-model="loading")
      v-card
        v-card-title
          h3  Deleting
        v-card-text
          v-progress-linear(indeterminate) 
    v-dialog(v-model="open")
      v-card
        v-card-title
          h3 Are you sure?
        v-card-text 
          v-text-field(
            v-model="confirm"
            messages="Please type in 'delete' to confirm"
          )
        v-card-actions
          v-btn.ma-2.primary--text(flat icon 
            @click.native="click" 
            v-if="valid"
          ) Delete 
          v-spacer
          v-btn.ma-2.primary--text(flat icon 
            @click.native="open=false" 
          ) Cancel
    v-btn.primary--text(flat icon 
      @click.native="open=true" 
    ) 
      v-icon() delete
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
  props:["loading"],
  data:function(){
    return {
      open:false,
      confirm:""
    }
  },
  components:{
  },
  computed:{
    valid:function(){
      return this.confirm.toLowerCase()==="delete"
    }
  },
  created:function(){
  },
  methods:{
    click:function(index){
      this.$emit("click",index)
      this.open=false
    }
  }
}
</script>
