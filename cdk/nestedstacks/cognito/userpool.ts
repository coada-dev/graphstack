import { NestedStack, RemovalPolicy } from "aws-cdk-lib";
import {
  AccountRecovery,
  AdvancedSecurityMode,
  AttributeMapping,
  CfnUserPoolGroup,
  CfnUserPoolGroupProps,
  ProviderAttribute,
  UserPool,
  UserPoolEmail,
  UserPoolIdentityProviderGoogle,
  UserPoolProps,
} from "aws-cdk-lib/aws-cognito";

import { Construct } from "constructs";

import { branch, domain, environment, region } from "#helpers/configuration.ts";
import { isProd } from "#helpers/environment.ts";
import handleOutputs from "#helpers/outputs.ts";

export default class UserPoolStack extends NestedStack {
  private isProduction: boolean = isProd(environment);

  public readonly userPool: UserPool;

  constructor(
    scope: Construct,
    userPoolProps: UserPoolProps,
  ) {
    super(scope, "userpool", {});

    this.userPool = this.createPool(userPoolProps);
    this.createDomain();
    this.createGoogleIDPOIDC({
      email: ProviderAttribute.GOOGLE_EMAIL,
      fullname: ProviderAttribute.GOOGLE_NAME,
      profilePicture: ProviderAttribute.GOOGLE_PICTURE,
    });

    ["administrators", "read", "write"].forEach((group) => {
      this.createGroup({
        groupName: group,
        userPoolId: this.userPool.userPoolId,
      });
    });
  }

  createDomain() {
    this.userPool.addDomain("domain", {
      cognitoDomain: {
        domainPrefix: `${branch}-${domain}`,
      },
    });
  }

  createGroup(props: CfnUserPoolGroupProps) {
    return new CfnUserPoolGroup(this, props.groupName!, props);
  }

  createGoogleIDPOIDC(attributeMapping: AttributeMapping) {
    if (
      process.env.GOOGLE_OIDC_CLIENT_ID &&
      process.env.GOOGLE_OIDC_CLIENT_SECRET
    ) {
      const provider = new UserPoolIdentityProviderGoogle(this, "oidc-google", {
        attributeMapping,
        clientId: process.env.GOOGLE_OIDC_CLIENT_ID,
        clientSecret: process.env.GOOGLE_OIDC_CLIENT_SECRET,
        scopes: ["openid", "profile", "email"],
        userPool: this.userPool,
      });
      this.userPool.registerIdentityProvider(provider);
    }

    return new Error("Missing arguments required for Google Identity Provider OIDC");
  }

  createPool(userPoolProps: UserPoolProps) {
    const userPool = new UserPool(this, "userpool", {
      accountRecovery: AccountRecovery.NONE,
      autoVerify: {
        email: false,
        phone: false,
      },
      advancedSecurityMode: AdvancedSecurityMode.OFF,
      deletionProtection: this.isProduction,
      email: UserPoolEmail.withCognito(),
      removalPolicy: this.isProduction
        ? RemovalPolicy.RETAIN
        : RemovalPolicy.DESTROY,
      signInCaseSensitive: false,
      ...userPoolProps,
    });

    handleOutputs(
      this,
      {
        label: "userPoolId",
        region,
        service: "cognito",
      },
      userPool.userPoolId,
    );
    handleOutputs(
      this,
      {
        label: "userPoolProviderUrl",
        region,
        service: "cognito",
      },
      userPool.userPoolProviderUrl,
    );

    return userPool;
  }
}
