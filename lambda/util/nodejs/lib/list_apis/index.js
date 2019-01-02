var fs=require('fs')
var _=require('lodash')
var memoize=require('memoizee')
process.env.AWS_REGION='us-east-1'
process.env.ASSETBUCKET="jmc-website"
process.env.ASSETPREFIX="sageguard"
process.env.REGIONNAME="US East (N. Virginia)"

var fncs=fs.readdirSync(__dirname)
    .filter(x=>x!=='index.js' && !x.match(/test/))
    .map(x=>x.match(/(.*)\.js/)[1])
    .map(x=>{
        console.log(x)
        return x
    })
    .map(x=>[x,memoize(require(`./${x}`),{
        promise:true,
        maxAge:5000,
        preFetch:true
    })])

var obj=_.unzip(fncs)

module.exports=function(){
    return Promise.all(
        obj[1].map((x,i)=>x().catch(e=>{
            console.log(obj[0][1][i],"a")
            throw e
        }))
    ).then(x=>_.fromPairs(_.zip(obj[0],x)))
}
