import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { StringAttribute } from "aws-cdk-lib/aws-cognito";

import { domain, environment } from "#helpers/configuration.ts";
import UserPoolStack from "#nestedstacks/cognito/userpool.ts";

const service = "createCognitoUserPool";

describe(`${service} Properties`, () => {
  let stack: Stack;
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    const p = new UserPoolStack(wrapper, {
      customAttributes: {
        roles: new StringAttribute({
          minLen: 0,
          maxLen: 2048,
          mutable: false,
        }),
      },
      userPoolName: environment,
    });

    stack = p;
    template = Template.fromStack(stack);
    // console.log(template, "template"); //?
    // console.log(template.toJSON(), "json");
  });

  it(`${service} resource`, () => {
    template.hasResource("AWS::Cognito::UserPool", {
      DeletionPolicy: "Delete",
      UpdateReplacePolicy: "Delete",
    });
  });

  it(`${service} resource properties`, () => {
    template.hasResourceProperties("AWS::Cognito::UserPool", {
      DeletionProtection: "INACTIVE",
      EmailConfiguration: {
        EmailSendingAccount: "COGNITO_DEFAULT",
      },
      Schema: [{ Name: "roles" }],
      UserPoolAddOns: {
        AdvancedSecurityMode: "OFF",
      },
      UserPoolName: environment,
    });
  });

  it(`${service} domain properties`, () => {
    template.hasResourceProperties("AWS::Cognito::UserPoolDomain", {
      Domain: `development-${domain}`,
    });
  });

  it(`${service} group properties`, () => {
    template.hasResourceProperties("AWS::Cognito::UserPoolGroup", {
      GroupName: "administrators" || "read" || "write",
    });
  });
});
