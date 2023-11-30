# GraphStack

[![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)](https://www.postman.com/fattist/workspace/coada/collection/11209-aad271c3-d6d3-4fcc-a22a-9aa230678dc4)


## Description

An opinionated monorepo for building a Typescript Serverless GraphQL Subgraph. This project will get an AWS-replica of a Serverless Apollo Server (v4) running on your host machine through LocalStack + AWS CDK. The overall goal of this project is to maximize environment parity from local development to production.

This repository uses LocalStack Pro for stacks like Cognito. If Pro services are not needed, feel free to modify the `docker-compose` image path to use the community version.

## Installation

```
brew install docker
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
[profile graphstack-local]
region = us-west-2
output = json
```

```
[profile graphstack-local]
source_profile = default
```

## tl;dr

Complete installation instructions first. It's suggested that for every code block below in this section, that you execute each code block in its own terminal window. Each command will have its own unique output, this is certainly true for `docker-compose` and the log tail it captures for your LocalStack environment.

From the root of the repository, execute the following commands to start your LocalStack environment:

```
docker-compose up
```

From `cdk/`, execute the following commands to deploy your CDK stacks to LocalStack environment:

```
asdf reshim nodejs
npx grunt local:clean
```

From `api/*`, execute the following commands to start your Apollo Server Subraph inside your LocalStack environment:

```
asdf reshim nodejs
npm run localstack
```

From `api/*`, execute the following commands to start Serverless Offline and `watch` on your api:

`watch` will deploy your API to LocalStack and restart your API when changes are detected through `hot-loading`.

```
asdf reshim nodejs
npm run offline
```

### Federation

Apollo allows you to deploy a the new-gen Rust Router to your local environment for Federation. Things like co-processors require an enterprise license, but the router is free to run locally.

As of writing this, the repository contains two subraphs, `foo` and `user`. These services don't utilize Federation strengths, but are configured to show the capability of local Federation.

`subgraph_url`: is used to compose the supergraph schema required for the Router to function.

If you deploy, modify, or add any new api services, you will need to update the `supergraph.yaml` to reflect your subgraphs and their requirements prior to executing this next step. This step relies heavily on Docker networking in order to connect containers to the LocalStack DNS server. Feel free to modify the subnet defined in `docker-compose.yml` to fit your network requirements.

If you want to run federation locally, with enterprise features, make sure to execute your `docker-compose` command out of the `enterprise` directory.

```
cd api/router/enterprise
```

```
cd api/router
asdf reshim nodejs

npm run supergraph:compose
docker-compose up
```

After starting the Router, you will be able to access the Router at `http://localhost:8000`. This repository uses the `8000` port range for Router in order to avoid port range conflicts with LocalStack in the `4000` range.

## Automation

tl;dr Grunt automates every contact point with any command line interface that this project touches. Feel free to use the CLI directly, but Grunt is the preferred method of interacting with this project.

## CDK

### AWS Authentication

Setup a profile for your project. Set the profile argument as the name of your project.

```
aws sso login --profile <profile>
```

Grunt will automatically pull the project name out of the root `package.json` within this repository and append the environment to that project name when executing CDK, e.g,. `graphstack-development`. To get a list of valid environments, view `cdk/helpers/environments`. To override, provide a `--profile` arg with the name of your AWS profile at runtime.

### CDK Applications

There are no default applications within the CDK scope. You need to explicitly define the application stack that you are attempting to deploy. You can deploy with CDK directly, but there are many benefits to using Grunt as a wrapper in this application. Utilizing CDK directly will require creation of a `cdk.json` file with an app node defined in the root of the `cdk/` directory. This approach is anti-pattern to the monorepo approach that this project is taking.

```
npx grunt deploy --account <account> --app=<app> --environment=<environment> --region=<region> --stackname=<stackname>
```

`--app` is an argument for an application stack within the `cdk/bin/` directory. The environment and region arguments are passed down through the application at execution. The account application stack has a hard-coded region, with reason, while other application stacks like environment are dynamic.

```
npx grunt deploy --account=000000000000 --app=account --environment=development --region=us-west-2 --stackname=oidc
```

The above command will achieve the following:
- deploy the `account` application stack
- deploy the `oidc` stack as a decendent of the `account` application stack
    - this will affect the naming convention of the stack and logical identifiers for your applications in AWS
- deploys to the `development` environment in `us-west-2`
- all stacks are prefixed with your branch name, e.g, `development-`
    - this easily allows for custom feature-based CI workflows
- stacks can easily be deployed to other environments, e.g., `staging`, `production`, etc.
    - stacks can also be deployed to any region, e.g., `us-east-1`, `us-west-2`, etc.
    - wildcards can be used for Grunt deployments with `--stackname *`, which will deploy all stacks within an application, but logical identifiers will not conform to the naming convention used when a stackname is physically defined
        - this will be an issue if services like Serverless are consuming SSM parameters from CDK stacks
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
npx grunt local:clean
```

If you'd like to modify or configure a new stack for deployment, declare execution within `grunt/aliases.json` under the `local` task alias. Make sure a complimentary configuration node exists within the `grunt/cdk.js` task file that matches the alias you have already created.

### Environment deployment from your host machine

If you're deploying to any ephemeral or stable stack from your host machine:

#### Region

Region is hard coded to the environment within `cdk/helpers/region.ts`.

#### Variables

`CDK_` prefixed variables are either acceptable via `--arg` to Grunt command, unless it's hardcoded like `region`. If you'd like to shorten the commands you have to feed to Grunt via CLI, you can create a `.env.<environment>` file at the root of the project. Grunt commands will pick up those `CDK_` prefixed variables and pass them to the CDK application at runtime.

## Wallaby

### VSCode

Open command pallette: `control + command + p`, select `Wallaby.js: Select Configuration File`, `Automatic Configuration <custom directory>`, and select the project that you want to run WallabyJS for. Each project is going to require a `wallaby.js` configuration file.

Wallaby does not load nested `tsconfig.json` files. Any typescript configuration for a project within this monorepo needs to be replicated in your project directory if your test runner, e.g. Jest, is not configured for it.
