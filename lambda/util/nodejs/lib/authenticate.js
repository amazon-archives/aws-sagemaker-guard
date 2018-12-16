var axios=require('axios')
var jwt=require('jsonwebtoken')
var jwkToPem = require('jwk-to-pem');

module.exports=function(token,userpool){
    var url=`https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${userpool}`
    try {
        var val=Promise.resolve(axios.get(`${url}/.well-known/jwks.json`))
            .then(x=>x.data.keys)

        var decoded=jwt.decode(token,{complete:true})    
        var use=decoded.payload.token_use==='id'
        var user=decoded.payload['cognito:username']
        return val.then(function(x){
            var key=x.filter(y=>y.kid===decoded.header.kid)[0]
            return jwt.verify(token,pem(key),{
                issuer:url
            })
        })
        .then(()=>decoded)
    }catch(e){
        console.log(e)
        return Promise.reject("Invalid Token:Failed to parse")
    }
}

function pem(key){
    var key_id = key.kid;
    var modulus = key.n;
    var exponent = key.e;
    var key_type = key.kty;
    var jwk = { kty: key_type, n: modulus, e: exponent};
    return jwkToPem(jwk);
}
