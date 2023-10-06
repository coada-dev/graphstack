import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

import { Region, getRegion } from "../../cdk/helpers/region";
import { environment } from "../../cdk/helpers/configuration";

class GetSSMRecordByPath {
  private client: SSMClient;

  private region: Region = getRegion(environment);

  constructor() {
    this.client = new SSMClient({ region: this.region });
  }

  async getSSMRecord() {
    const command = new GetParameterCommand({
      Name: process.env.SSM_PATH,
    });

    const { Parameter } = await this.client.send(command);

    return [process.env.SSM_PATH?.split("-").pop(), Parameter?.Value].join(",");
  }
}

const klass = new GetSSMRecordByPath();

const handler = async (): Promise<void> => {
  try {
    console.log(await klass.getSSMRecord());
  } catch (error: unknown) {
    throw new Error((<Error>error).message);
  }
};

handler().catch(Error);
