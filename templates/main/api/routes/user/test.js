var Velocity=require('velocity')
var temp=new Velocity.Engine({
    template:"list.res.vm",
    debug:true
})
var result=temp.render(require("./test.json"))
console.log(result)


