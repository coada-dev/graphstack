import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { UserPoolClientIdentityProvider } from "aws-cdk-lib/aws-cognito";

import { branch, domain, environment, fqdn } from "#helpers/configuration.ts";
import { Ports } from "#helpers/ports.ts";
import CognitoClientStack from "#nestedstacks/cognito/client.ts";
import UserPoolStack from "#nestedstacks/cognito/userpool.ts";

const application = "application";
const stackName = "createCognitoUserPoolClient";

describe(stackName, () => {
  let clientTemplate: Template;
  let poolTemplate: Template;

  beforeAll(() => {
    const app = new App();
    const wrapper = new Stack(app);

    const poolStack = new UserPoolStack(wrapper, {
      userPoolName: environment,
    });

    const clientStack = new CognitoClientStack(wrapper, application, {
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
      userPool: poolStack.userPool,
    });

    clientTemplate = Template.fromStack(clientStack);
    poolTemplate = Template.fromStack(poolStack);
    // console.log(template, "template"); //?
    // console.log(template.toJSON(), 'json');
  });

  it(`${stackName} UserPoolClient properties`, async () => {
    poolTemplate.hasResourceProperties("AWS::Cognito::UserPoolClient", {
      AllowedOAuthFlows: ["code"],
      AllowedOAuthFlowsUserPoolClient: true,
      AllowedOAuthScopes: [
        "aws.cognito.signin.user.admin",
        "email",
        "openid",
        "profile",
      ],
      CallbackURLs: Match.arrayWith([
        `https://${branch}.${application}.${fqdn}/idp/callback`,
        `https://${branch}.${application}.${environment}.${domain}.localhost:${Ports.vite}/idp/callback`,
      ]),
      ClientName: `${branch}-${application}-client`,
      ExplicitAuthFlows: [
        "ALLOW_CUSTOM_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
        "ALLOW_USER_SRP_AUTH",
      ],
      LogoutURLs: Match.arrayWith([
        `https://${branch}.${application}.${fqdn}/logout`,
        `https://${branch}.${application}.${environment}.${domain}.localhost:${Ports.vite}/logout`,
      ]),
      PreventUserExistenceErrors: "ENABLED",
      SupportedIdentityProviders: ["COGNITO"],
    });
  });

  it(`${stackName} SSM properties`, () => {
    clientTemplate.hasResourceProperties("AWS::SSM::Parameter", {
      Name: `/cognito/${branch}-${application}-userPoolClientId`,
      Type: "String",
    });
  });
});
