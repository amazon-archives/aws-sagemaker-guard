module.exports={"qna":[{
    "qid":"hello",
    "q":["hello","hi","hey"],
    "a":"Hi! welcome to the SageGuard Admin interface.",
    "alt":{
        "markdown":`__Hi__! Welcome to the SageGuard Admin UI. I am here to help answer your questions. You can ask me things like:
- How do I create an instance?
- How do I reset a user's password?
- What do I do if an instance has failed to launch?

If I cannot answer your question, create an issue in the github repo for the project [here](https://github.com/aws-samples/aws-sagemaker-guard/issues) to add the question.
`
    }
},
{
    "qid":"how.1",
    "q":["how do I create an instance","how do I create a sagemaker notebook instance"],
    "a":"like this",
    alt:{
        markdown:`There are a couple of ways to create instances. follow these instructions.
        
1. go to the home page
1. do one of the following things
    - Select "Create A User and their instance together"
    - Select "Create Multiple Users and Instances"
    - Select "Go To" in the SageMaker Instances card. In the next page Select "Create a new SageMaker notebook instance"
`
    }
},
{
    "qid":"how.4",
    "q":["how do I create a IAM role for a sagemaker instance",
        "how do I create a role"],
    "a":"go here",
    alt:{
        markdown:`1. go to the [IAM console](https://console.aws.amazon.com/iam/home#/home)
1. On the left hand menu select __roles__
1. At the top select __create role__
1. Select __AWS Service__ then under "Choose the service that will use this role" select __sagemaker__ then select __next: permissions__ at the bottom
1. Select __next: tags__. You can edit the permissions of your role later
1. Select __next: review__
1. give your role a name and select __create role__
1. Search for your role using the search bar at the top and select your role
1. From here you can edit your permissions. 
`
    }
},
{
    "qid":"how.5",
    "q":["How to I create a glue development endpoint"],
    "a":"here",
    alt:{
        markdown:"follow the instructions [here](https://docs.aws.amazon.com/glue/latest/dg/console-development-endpoint.html)"
    }
},
{
    "qid":"how.6",
    "q":["How do i reset a users password"],
    "a":"go here",
    alt:{
        markdown:`1. Open up the menu in the top left
1. scroll down and select __Cognito UserPool Console__
1. In the left hand menu select __Users and Groups__
1. Search for the user and select there name
1. at the top select __reset password__
`
    }
},
{
    "qid":"how.8",
    "q":["How to I blacklist/whitelist IP addresses"],
    "a":"go here",
    alt:{
        markdown:`1. Open up the menu in the top left
1. Scroll down and select __Cognito UserPool Console__
1. In the left hand menu select __Advanced Security__
1. Scroll to the bottom to the section title __Do you want to add exceptions for any IP addresses?__ and add/remove the IP address you want to blacklist/whitelist
`
    }
},
{
    "qid":"how.9",
    "q":["what do i do if a instance failed to create"],
    "a":"go here",
    alt:{
        markdown:"To debug an instance failure go to the [cloudformation console](https://console.aws.amazon.com/cloudformation/home?region=${AWS::Region}#/stacks?filter=deleted). Failed stacks are automatically deleted so find that stack for your instance. You can get the stack name from the instance information in the Admin UI. Under events you can see what resource failed to create. If is was and SSM hook document that caused the failure you will have to go to the [SSM](https://console.aws.amazon.com/systems-manager/home?region=${AWS::Region}#) console to debug your scripts."
    }
},
]}
