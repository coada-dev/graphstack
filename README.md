# smaaash

## Description

A smarter, funnier, more efficient Discord bot designed to integrate with your Twitch channel. Administrate user management, goals, cheers, scams with smaaash.

## Installation

```
brew install asdf
asdf plugin-add nodejs
asdf plugin-add python
asdf install
cp .env.example .env.local
pip3 install --upgrade pip
```

This repository is a monorepo and additional services are represented as subdirerctories, listed as workspaces in the root `package.json` of this repository.

```
asdf reshim
npm i
pip install -r requirements.txt
```

Configure a local environment project profile within your AWS configuration file inside your `.aws` home directory. Configure how you'd like, but make sure not to override credential process and make sure you don't define an account number!

```
[profile smaaash-local]
region = us-west-2
output = json
```

```
[profile smaaash-local]
source_profile = default
```

## Automation

tl;dr Grunt automates every contact point with any command line interface that this project touches. Feel free to use the CLI directly, but Grunt is the preferred method of interacting with this project.

## CDK

### AWS Authentication

Setup a profile for your project. Set the profile argument as the name of your project.

```
aws sso login --profile <profile>
```

Grunt will automatically pull the project name out of the root `package.json` within this repository and append the environment to that project name when executing CDK, e.g,. `smaaash-development`. To get a list of valid environments, view `cdk/helpers/environments`. To override, provide a `--profile` arg with the name of your AWS profile at runtime.

### CDK Applications

There are no default applications within the CDK scope. You need to explicitly define the application stack that you are attempting to deploy. You can deploy with CDK directly, but there are many benefits to using Grunt as a wrapper in this application.

```
npx grunt deploy --account <account> --app=<app> --environment=<environment> --region=<region> --stackname=<stackname>
```

`--app` is an argument for an application stack within the `cdk/bin/` directory. The environment and region arguments are passed down through the application at execution. The account application stack has a hard-coded region, with reason, while other application stacks like environment are dynamic.

```
npx grunt deploy --account=000000000000 --app=account --environment√development --region=us-west-2 --stackname=oidc
```

The above command will achieve the following:
- deploy the `account` application stack
- deploy the `oidc` stack as a decendent of the `account` application stack
    - this will affect the naming convention of the stack and logical identifiers for your applications in AWS
- deploys to the `development` environment in `us-west-2`
- all stacks are prefixed with `development-`
- stacks can easily be deployed to other environments, e.g., `staging`, `production`, etc.
    - stacks can also be deployed to any region, e.g., `us-east-1`, `us-west-2`, etc.
    - wildcards can be used for Grunt deployments with `--stackname *`, which will deploy all stacks within an application, but logical identifiers will not conform to the naming convention used when a stackname is physically defined
- all applications define account numbers and regions to allow multi-account, and multi-region deployments when `crossRegionReferences` is defined within the application stack
    - this will be required for cross-account, cross-region, dependencies like ACM in `us-east-1` for CloudFront deployments

#### LocalStack

CDK account numbers default to `000000000000`. This is a valid account number for LocalStack deployments. The deployment process to LocalStack is identical to AWS, but the account number is not required.

```
npx grunt deploy --app=environment --stackname=environment
```

## Local Deployment

tl:dr;

```
npx grunt local
```

If you'd like to modify or configure a new stack for deployment, declare execution within `grunt/aliases.json` under the `local` task alias. Make sure a complimentary configuration node exists within the `grunt/cdk.js` task file that matches the alias you have already created.