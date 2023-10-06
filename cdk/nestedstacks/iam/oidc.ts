import { App, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  Effect,
  IPrincipal,
  OpenIdConnectPrincipal,
  OpenIdConnectProvider,
  Policy,
  PolicyDocument,
  PolicyStatement,
  Role,
} from "aws-cdk-lib/aws-iam";

import { githubOrganization as organization } from "#helpers/configuration.ts";

/* istanbul ignore next */
export default class GithubOIDCStack extends Stack {
  private stackProps: StackProps;

  protected clientIds = ["sts.amazonaws.com"];

  protected url = "https://token.actions.githubusercontent.com";

  constructor(scope: App, namespace: string, props: StackProps) {
    super(scope, namespace, props);
    this.stackProps = props;

    const provider: OpenIdConnectProvider = this.setupOIDCProvider(namespace);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const principal: IPrincipal = this.setupOIDCPrincipal(provider)!;

    const role: Role = this.setupPrincipalRole(namespace, principal);
    role.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // TODO: temp fix for permissions issue with Github permissions and deletion of CDK application
    this.administratorInlinePolicy(namespace, role);
  }

  administratorInlinePolicy(namespace: string, role: Role) {
    role.attachInlinePolicy(
      new Policy(this, `${namespace}-policy-admin`, {
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["*"],
            resources: ["*"],
          }),
        ],
      }),
    );
  }

  setupPrincipalRole(namespace: string, principal: IPrincipal): Role {
    return new Role(this, `${namespace}-role`, {
      assumedBy: principal,
      description:
        "CDK controlled IAM Principal Role for Github short-lived access",
      roleName: "githubOIDCPrincipalRole",
      maxSessionDuration: Duration.hours(1),
      inlinePolicies: {
        CdkDeploymentPolicy: new PolicyDocument({
          assignSids: true,
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["sts:AssumeRole"],
              resources: [
                `arn:aws:iam::${this.stackProps.env?.account}:role/cdk-*`,
              ],
            }),
          ],
        }),
      },
    });
  }

  setupOIDCPrincipal(provider: OpenIdConnectProvider) {
    let ctx;

    // NOTE: this method will error out a build if an OIDC principal already exists
    try {
      // eslint-disable-next-line no-new
      ctx = new OpenIdConnectPrincipal(provider).withConditions({
        StringLike: {
          "token.actions.githubusercontent.com:sub": `repo:${organization}/*:*`,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(error);
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return ctx;
    }
  }

  setupOIDCProvider(namespace: string) {
    return new OpenIdConnectProvider(this, `${namespace}-provider`, {
      url: this.url,
      clientIds: this.clientIds,
    });
  }
}
