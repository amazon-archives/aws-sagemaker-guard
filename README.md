# AWS-SageMaker-Gaurd

> AWS-SageMaker-Guard: Amazon SageMaker notebook instance management at scale using Amazon Cognito, Amazon Cloud Directory, and AWS Systems Manager

## Overview

## Prerequisites

- Run Linux. (tested on Amazon Linux)
- Install npm >3 and node >6. ([instructions](https://nodejs.org/en/download/))
- Clone this repo.
- Set up an AWS account. ([instructions](https://AWS.amazon.com/free/?sc_channel=PS&sc_campaign=acquisition_US&sc_publisher=google&sc_medium=cloud_computing_b&sc_content=AWS_account_bmm_control_q32016&sc_detail=%2BAWS%20%2Baccount&sc_category=cloud_computing&sc_segment=102882724242&sc_matchtype=b&sc_country=US&s_kwcid=AL!4422!3!102882724242!b!!g!!%2BAWS%20%2Baccount&ef_id=WS3s1AAAAJur-Oj2:20170825145941:s))
- Configure AWS CLI and local credentials. ([instructions](http://docs.AWS.amazon.com/cli/latest/userguide/cli-chap-welcome.html))  

## Getting Started
First, install all prerequisites:
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

Now edit config.json with you information.

| param | description | 
|-------|-------------|
|region | the AWS region to launch stacks in |
|profile| the AWS credential profile to use |
|namespace| a logical name space to run your templates in such as dev, test and/or prod |
|templateBucket | the S3 bucket to upload assets to. Get this value from the output of your bootstrap stack you just created |
|templatePrefix | the prefix in the templateBucket to upload assets |
|devEmail | the email to use when creating admin users in automated stack launches |
|devPhoneNumber | the email to use when creating admin users in automated stack launches |

Next, build all the assets, upload them to the bootstrap bucket, and launch the stack by running the following command:
```shell
npm run up
```

## Components
### CloudFormation Templates
the individual cloud formation templates are the in the /templates directory

### Lambda Functions and Layers
The code for Lambda function zip files and layers are found in the /lambda directory.

### Web interface
the code for the Admin UI and User Landing page are in the /website directory

## Built With

* [Vue](https://vuejs.org/) 
* [Webpack](https://webpack.github.io/)

## License
See the [LICENSE.md](LICENSE.md) file for details
