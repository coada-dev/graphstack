import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";

interface SSMParameterReaderProps {
  readonly parameterName: string;
  readonly region: string;
}

export default class SSMParameterReader extends AwsCustomResource {
  constructor(scope: Construct, name: string, props: SSMParameterReaderProps) {
    const { parameterName, region } = props;

    super(scope, name, {
      onUpdate: {
        action: "getParameter",
        service: "SSM",
        parameters: {
          Name: parameterName,
        },
        region,
        physicalResourceId: PhysicalResourceId.of(name),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });
  }

  getParameterValue(): string {
    return this.getResponseFieldReference("Parameter.Value").toString();
  }
}
