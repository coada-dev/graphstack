import { Environment } from "./environment";

export enum Region {
  development = "us-west-2",
  local = "us-west-2",
  production = "us-east-1",
  staging = "us-east-2",
  test = "us-west-1",
}

export type Regions = Array<Region> | [];

export function getRegion(environment: Environment): Region {
  return environment
    ? Region[environment as keyof typeof Region]
    : Region.development;
}

export function getRegions(environment: Environment): Regions {
  return environment === "production"
    ? Object.values(Region)
    : [Region.development, Region.test];
}
