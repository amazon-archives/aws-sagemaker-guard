<template lang='pug'>
  v-app
    v-navigation-drawer(temporary v-model="open" app)
      v-toolbar(flat)
        v-list
          v-list-tile
            v-list-tile-title.title Tools
      v-divider
      v-list(dense three-line subheader)
        v-progress-circular(indeterminate v-if="!pages.length" 
          style="width:100%; margin: 20px 0px;" 
        )
        v-list-tile(
          @click="drawer=false"
          href="#/home/"
          id="page-link-home"
          target='_self'
        )
          v-list-tile-avatar
            v-icon(color="primary") home
          v-list-tile-content
            v-list-tile-title home 
        v-list-tile(v-for="(page,index) in pages" :key="index"
          @click="drawer=false"
          :href="'#/home/'+page.name"
          :id="'page-link-'+page.name"
          target='_self'
          )
          v-list-tile-avatar( v-if="page.render")
            v-icon(color="primary") {{page.render}}
          v-list-tile-content
            v-list-tile-title {{page.name}}
            v-list-tile-sub-title {{page.prompt}}
      v-list(dense one-line)
        v-list-group( prepend-icon="info" value="true" color="primary" expand="true")
          v-list-tile(slot="activator")
            v-list-tile-title Info
          v-list-tile(v-for="(value,name) in  info" 
                :key="name")
            v-list-tile-title {{name}}: {{value}}
    v-toolbar
      v-toolbar-side-icon.primary--text(
        id="nav-open"
        @click.stop="open = !open"
      )
      v-toolbar-title SageGuard Administration
      v-spacer
      v-toolbar-items
        v-btn(flat @click="logout") Logout
    v-container(fluid id="workspace")
      v-layout(column)
        v-flex
          router-view
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
  data:()=>{
    return {
      open:false
  }},
  components:{},
  computed:{
    pages:function(){
      return _.get(this,"$store.state.data.links.items",[])
    },
    info:function(){
      return _.get(this,"$store.state.data.info",{})
    }
  },
  created:function(){},
  methods:{
    logout:function(){
      this.$store.dispatch('user/logout')
    }
  },
  onIdle:function(){
    window.alert("Sorry, you are being logged out for being idle. Please log back in")
    this.logout()
  }
}
</script>

<style lang='scss' scoped>
</style>

