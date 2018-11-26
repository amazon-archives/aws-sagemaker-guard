# AWS SageMaker Sign On

> Add user sign on and managment to SageMaker NoteBook Instances 

## Overview

## Prerequisites

- Run Linux. (tested on Amazon Linux)
- Install npm >3 and node >6. ([instructions](https://nodejs.org/en/download/))
- Clone this repo.
- Set up an AWS account. ([instructions](https://AWS.amazon.com/free/?sc_channel=PS&sc_campaign=acquisition_US&sc_publisher=google&sc_medium=cloud_computing_b&sc_content=AWS_account_bmm_control_q32016&sc_detail=%2BAWS%20%2Baccount&sc_category=cloud_computing&sc_segment=102882724242&sc_matchtype=b&sc_country=US&s_kwcid=AL!4422!3!102882724242!b!!g!!%2BAWS%20%2Baccount&ef_id=WS3s1AAAAJur-Oj2:20170825145941:s))
- Configure AWS CLI and local credentials. ([instructions](http://docs.AWS.amazon.com/cli/latest/userguide/cli-chap-welcome.html))  

## Getting Started
Fiuit, install all prerequisites:
```shell
npm install 
```

setup config:
```shell 
cp config.json.example config.json
```

Next, use the following command to launch a CloudFormation template to create the S3 bucket to be used for lambda code and CloudFormation templates. Wait for this template to complete (you can watch progress from the [AWS CloudFormation console](https://console.AWS.amazon.com/cloudformation/home))  
```shell
npm run stack dev/bootstrap up
```

After the template has launched, use the following command to build all assets and upload to the S3 bucket created in the previous step:
```shell
npm run upload
```

```shell
npm run stack test/master up
```
## Services
### CloudDirectory 
Used to store information about users, groups, policies, accounts, and roles along with relationships between each other. Roles are attached to accounts and policies, policies are attached to users and groups giving access to the roles attached to the policy, and users can be attached to groups. To implement this we us node,leafs,indices, and policies. 

### ApiGateway
creates a REST interface to the ENOVY system
1) Lambda
    Apigateway will proxy certain requests to a Lambda function which interacts with CloudDirectory,
2) S3
    Apigateway also proxies some requests to an s3 hosted website for the static assets of the UI. So both the REST api and website are hosted under a single domain. This allows the static website to interact with the api. 
3) IAM
    sensitive api endpoints are protect by IAM. Request have to be sigv4 signed. 

### Cognito
manages users.
1) UserPool
    where users are store (in addition to being stored in CloudDirectory). Also provides authentication, user passwords are only stored here. 
2) Id pool
    Allows users to exchange the jwt token they get from authenticating with Cognito to allow access to api endpoints. 
3) Hosted Login 
    provides a page where users are logged in and upon success are redirected to the ENVOY ui with their jwt token. Also provides password change flow. 

## Components
### CloudFormation Templates

### Lambda Functions
Lambda functions are found in the /lambda directory.

### Web interface

## Running Tests
The following will launch a CloudFormation template to create AWS resources in your account that are used in the Lambda, CloudFormation, and WebUI tests. 
```shell
npm run dev-up
```

Once the template has completed you can run the tests in the following sections.

### CloudFormation tests
The CloudFormation test templates are in the templates/test folder. Run a template test with:
```shell
npm run stack test/{template-name}
```

For example, if you want to launch a template with filename "es.json" run the following command:
```shell
npm run check test/es
```

You also can check a template's syntax with:
```shell
npm run check {template's directory relative to /templates}/{template-name}
```

### Running Lambda Function tests
Each lambda directory has its own tests that can be run by executing the following command in that directory:
```shell
npm run test
```

### Admin UI Compatibility 
Currently the only browsers supported are:  
    Chrome  
    FireFox  
We are currently working on adding Microsoft Edge support.  

## Built With

* [Vue](https://vuejs.org/) 
* [Webpack](https://webpack.github.io/)

## License
See the [LICENSE.md](LICENSE.md) file for details
