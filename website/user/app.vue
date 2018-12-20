<template lang='pug'>
  v-app
    v-navigation-drawer(temporary v-model="open" app)
      v-toolbar(flat)
        v-list
          v-list-tile
            v-list-tile-title.title Tools
      v-divider
      v-list(dense three-line subheader)
        v-list-tile(v-for="(page,index) in pages" :key="'page-link-'+page.name"
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
    v-toolbar
      v-toolbar-side-icon.primary--text(
        id="nav-open"
        @click.stop="open = !open"
      )
      v-toolbar-title SageGuard Instance Access
      v-spacer
      v-toolbar-items
        v-btn( @click="refresh") refresh
        v-btn( @click="logout") Logout
    v-container(fluid grid-list-md v-if="!loading")
      router-view
    v-container(v-if="loading")
        v-flex(xs8 offset-xs2)
          v-progress-linear( indeterminate)
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
      loading:false,
      open:false
  }},
  components:{
    instance:require('./components/instance.vue') 
  },
  computed:{
    loginUrl:function(){
      return document.head.querySelector("link[rel=login]").href
    },
    instances:function(){
      return _.get(this,"$store.state.api.instances",[])
    },
    pages:function(){
      return _.get(this,"$store.state.api.state.items",[])
    }
  },
  created:function(){
    this.loading=true
    this.$store.dispatch('user/login') 
    this.$store.dispatch('api/init')
      .then(()=>this.loading=false)
      .catch(()=>this.loading=false)
  },
  methods:{
    logout:function(){
      this.$store.dispatch('user/logout')
      window.location=this.loginUrl
    },
    refresh:function(){
      this.loading=true
      this.$store.dispatch('api/list')
        .then(()=>this.loading=false)
        .catch(()=>this.loading=false)
    }
  },
  onIdle:function(){
    window.alert("Sorry, you are being logged out for being idle. Please log back in")
    this.logout()
  }
}
</script>

<style lang='scss' scoped>
  #workspace {
    margin-top:60px;
  }
</style>

