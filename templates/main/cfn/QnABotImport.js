var aws=require('aws-sdk')
var response = require('cfn-response')
var URL=require('url')
aws.config.region=process.env.AWS_REGION
var s3=new aws.S3()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    var url=URL.parse(params.QnABotUrl)
    var host=url.host
    var api=url.path.split('/')[1]

    if(event.RequestType!=="Delete"){
        var Body=params.content.qna
            .map(x=>JSON.stringify(x))
            .join('\n')
        send({
            host,
            path:`/${api}/`,
        })
        .then(result=>{
            var path=URL.parse(result._links.jobs.href).path
            return send({host,path})
        })
        .then(result=>{
            var bucket=result._links.imports.bucket
            var key=`${result._links.imports.uploadPrefix}/${event.RequestId}`
            return s3.putObject({
                Bucket:bucket,
                Key:key,
                Body:Body
            }).promise()
        })
        .then(result=>{
            console.log(result)
            response.send(event, context, response.SUCCESS)
        })
        .catch(e=>{
            console.log(e)
            response.send(event, context, response.FAILED)
        })
    }else{
        response.send(event, context, response.SUCCESS)
    }
}

function send(opts){
    console.log(opts)
    return new Promise(function(resolve,reject){
    try{
        var endpoint = new aws.Endpoint(opts.host);

        var request = new aws.HttpRequest(endpoint, aws.config.region);
        var credentials = aws.config.credentials
        
        request.method=opts.method || "GET"
        request.path=opts.path
        request.headers['Host'] = opts.host;
        if(opts.body){
            request.body=JSON.stringify(opts.body)
        }
        request.headers['Content-Type'] = 'application/json';

        console.log(credentials)  
        var signer = new aws.Signers.V4(request,"execute-api");
        signer.addAuthorization(credentials, new Date());
        console.log(request)
        var client = new aws.HttpClient();
        client.handleRequest(request, null, function(response) {
            console.log(response.statusCode + ' ' + response.statusMessage);
            var responseBody = '';
            response.on('data', function (chunk) {
                responseBody += chunk;
            });
            response.on('end', function (chunk) {
                console.log('Response body: ' + responseBody);
                resolve(JSON.parse(responseBody)) 
            });
          }, function(error) {
            console.log('Error: ' + error);
            reject(error)
        });
    }catch(e){
        console.log(e)
        reject(e)
    }})
}
