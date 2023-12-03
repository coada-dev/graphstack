/* eslint-disable no-new */
import { CfnOutput } from "aws-cdk-lib";
import { StringListParameter, StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export default function handleOutputs(
  scope: Construct,
  options: { [key: string]: string },
  context: string,
  dependency?: Construct,
) {
  if (options.label && options.region && options.service) {
    const output = new CfnOutput(scope, `output-${options.label}`, { value: context });
    const parameter = new StringParameter(
      scope,
      `${options.region}-${options.label}`,
      {
        parameterName: `/${options.service}/${options.label}`,
        stringValue: context,
      },
    );

    if (dependency) {
      output.node.addDependency(dependency);
      parameter.node.addDependency(dependency);
    }
  }
}

export function handleOutputsList(
  scope: Construct,
  options: { [key: string]: string },
  context: string[],
  dependency?: Construct,
) {
  if (options.label && options.region && options.service) {
    const output = new CfnOutput(scope, `output-${options.label}`, { value: context.join(",") });
    const parameter = new StringListParameter(
      scope,
      `${options.region}-${options.label}`,
      {
        parameterName: `/${options.service}/${options.label}`,
        stringListValue: context,
      },
    );

    if (dependency) {
      output.node.addDependency(dependency);
      parameter.node.addDependency(dependency);
    }
  }
}