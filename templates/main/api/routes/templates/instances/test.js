var fs=require('fs')
var Velocity=require('velocity')

var temp=new Velocity.Engine({
    template:"res.vm",
    debug:true
})

var result=temp.render({})
    
