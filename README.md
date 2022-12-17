# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## Setup LocalStack

## Install Python
1. install pip3
2. install venv
### use virtual environment
1. https://realpython.com/python-virtual-environments-a-primer/#create-it
### activate virtual environment
1. https://realpython.com/python-virtual-environments-a-primer/#activate-it
## Install localstack
1. https://github.com/localstack/localstack
2. > pip3 install localstack
3. https://docs.localstack.cloud/getting-started/installation/#localstack-cli

## Install aws libraries needed 
> npm install -g aws-cdk-local aws-cdk
> pip3 install awscli-local (used to look at local stack)

## Start Localstack
1. https://github.com/localstack/localstack#example
2. setup localstack
3. > cdklocal bootstrap
4. Now you can deploy your stack locally
5. > awslocal deploy
6. 
## Deploy Stack to localstack