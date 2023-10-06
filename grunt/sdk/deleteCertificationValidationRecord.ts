// NOTE: https://github.com/aws/aws-cdk/pull/24543#issuecomment-1462469307
import {
  ChangeResourceRecordSetsCommand,
  ListResourceRecordSetsCommand,
  ListHostedZonesCommand,
  ResourceRecordSet,
  Route53Client,
  ListResourceRecordSetsResponse,
} from "@aws-sdk/client-route-53";

import { domain, environment, tld } from "../../cdk/helpers/configuration";
import { getRegion } from "../../cdk/helpers/region";

class DeleteCNAMERecord {
  private client: Route53Client;

  private hostedZoneId: string;

  private region = getRegion(environment);

  public readonly stack = process.env.CDK_STACK;

  constructor() {
    this.client = new Route53Client({ region: this.region });
  }

  async deleteRecordSets(type = "CNAME") {
    const command = new ListResourceRecordSetsCommand({
      HostedZoneId: this.hostedZoneId,
    });

    const { ResourceRecordSets }: ListResourceRecordSetsResponse =
      await this.client.send(command);

    ResourceRecordSets?.forEach(async (record: ResourceRecordSet) => {
      if (
        (record.Type === type && type !== "NS") ||
        (record.Type === type && record.Name !== `${this.stack}.${environment}.${domain}.${tld}.`)
      ) {
        const resource = new ChangeResourceRecordSetsCommand({
          ChangeBatch: {
            Changes: [
              {
                Action: "DELETE",
                ResourceRecordSet: record,
              },
            ],
          },
          HostedZoneId: this.hostedZoneId,
        });

        try {
          const action = await this.client.send(resource);

          // eslint-disable-next-line no-console
          console.log({ Name: record.Name, ...action.ChangeInfo });
        } catch (error: unknown) {
          throw new Error((<Error>error).message);
        }
      }
    });
  }

  async getHostedZoneId() {
    if (environment) {
      const command = new ListHostedZonesCommand({});
      const { HostedZones } = await this.client.send(command);

      if (HostedZones) {
        const [zone] = HostedZones.filter(
          (z) => z.Name === `${this.stack}.${environment}.${domain}.${tld}.`,
        );

        if (zone.Id) {
          this.hostedZoneId = zone.Id;
        }
      }
    }
  }
}

const klass = new DeleteCNAMERecord();
const handler = async (): Promise<void> => {
  try {
    await klass.getHostedZoneId();
    await klass.deleteRecordSets();

    if (klass.stack === "dns") {
      await klass.deleteRecordSets("NS");
    }
  } catch (error: unknown) {
    throw new Error((<Error>error).message);
  }
};

handler().catch(Error);
