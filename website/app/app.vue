<template lang='pug'>
  v-app
    v-toolbar
      v-toolbar-side-icon.primary--text(
        id="nav-open"
        @click.stop="open = !open"
      )
      v-toolbar-title 
        h1 {{title}}
      v-spacer
      v-toolbar-items
        v-btn(flat @click="logout") Logout
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
          :href="'#/'+type+'/'"
          id="page-link-home"
          target='_self'
          v-if="type==='admin'"
        )
          v-list-tile-avatar
            v-icon(color="primary") home
          v-list-tile-content
            v-list-tile-title 
              h4 home 
        v-list-tile(v-for="(page,index) in pages" :key="'page-link-'+page.name"
          @click="drawer=false"
          :href="'#/'+page.rel+'/'+page.name+'?href='+encodeURI(page.href)"
          :id="'page-link-'+page.name"
          target='_self'
          )
          v-list-tile-avatar( v-if="page.render")
            v-icon(color="primary") {{page.render}}
          v-list-tile-content
            v-list-tile-title 
              h4 {{page.title || page.name}}
            v-list-tile-sub-title {{page.prompt}}
        v-list-tile(v-for="(link,index) in links" :key="'page-link-'+link.name"
          :href="link.href"
          :id="'page-link-'+link.name"
          target='_blank'
          )
          v-list-tile-avatar( v-if="link.render")
            v-icon(color="primary") {{link.render}}
          v-list-tile-content
            v-list-tile-title {{link.name}}
            v-list-tile-sub-title {{link.prompt}}
      v-list(dense one-line)
        v-list-group( prepend-icon="info" value="true" color="primary" expand="true"
          v-if="Object.keys(info).length>0"
        )
          v-list-tile(slot="activator")
            v-list-tile-title Info
          v-list-tile(v-for="(value,name) in  info" 
                :key="name")
            v-list-tile-title {{name}}: {{value}}
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
      open:null
  }},
  components:{},
  computed:{
    pages:function(){
      return _.get(this,"$store.state.data.links.links",[])
        .concat(_.get(this,"$store.state.api.root.links",[]))
        .filter(x=>x.rel!=="external")
    },
    links:function(){
      return _.get(this,"$store.state.data.links.links",[])
        .concat(_.get(this,"$store.state.api.root.links",[]))
        .filter(x=>x.rel==="external")
    },
    info:function(){
      return _.get(this,"$store.state.data.info",{})
    },
    type:function(){
      return _.get(this,"$store.state.user.type",{})
    },
    title:function(){
      var name=_.get(this,"$store.state.user.name")
      if(name){
        return `${document.title}: ${name}`
      }else{
        return document.title
      }
    }
  },
  created:function(){
    this.$vuetify.theme={
        primary: '#1fbcd3',
        accent: '#ffbb00',
        secondary: '#3157d5',
        info: '#0D47A1',
        warning: '#ffba21',
        error: '#a71000',
        success: '#1ddf48'
    }
  },
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

<style lang='scss'>
body .application {
  font-family: 'Nunito', sans-serif;
}

body .v-btn {
  font-weight:800;
}
</style>

