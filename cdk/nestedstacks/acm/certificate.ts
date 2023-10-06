import { NestedStack } from "aws-cdk-lib";
import {
  Certificate,
  CertificateProps,
} from "aws-cdk-lib/aws-certificatemanager";
import { ComparisonOperator } from "aws-cdk-lib/aws-cloudwatch";

import { Construct } from "constructs";

export default class CertificateStack extends NestedStack {
  public readonly certificate: Certificate;

  private namespace: string;

  constructor(
    scope: Construct,
    namespace: string,
    certificateProps: CertificateProps,
  ) {
    super(scope, namespace, {});

    this.namespace = namespace;
    this.certificate = new Certificate(this, this.namespace, certificateProps);
  }

  createAlarm() {
    this.certificate
      .metricDaysToExpiry()
      .createAlarm(this, `${this.namespace}-expiration-alarm`, {
        comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
        evaluationPeriods: 1,
        threshold: 45,
      });
  }
}
