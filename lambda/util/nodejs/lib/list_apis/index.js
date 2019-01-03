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

exports.run=function(){
    return Promise.all(
        obj[1].map((x,i)=>x().catch(e=>{
            console.log(obj[0][1][i],"a")
            throw e
        }))
    ).then(x=>_.fromPairs(_.zip(obj[0],x)))
}

exports.doc=function(input,filter){
    return input.ssm
        .filter(x=>x.tags[filter]=="true")
        .map(x=>{return{
            "text":x.tags.DisplayName || x.Name,
            "value":x.Name,
            "description":x.Description,
            "href":`https://console.aws.amazon.com/systems-manager/documents/${x.Name}/description?region=${process.env.AWS_REGION}`
        }})
}
