import { getBranch } from "#helpers/branch.ts";
import { Environment, TLD } from "#helpers/environment.ts";
import { getRegion, Region } from "#helpers/region.ts";

import { name as appName } from "../../package.json";

export const account: string = process.env.CDK_ACCOUNT || "000000000000";
export const branch: string = getBranch();
export const domain: string = process.env.CDK_DOMAIN || appName;
export const environment: Environment = process.env.CDK_ENVIRONMENT
    ? Environment[process.env.CDK_ENVIRONMENT as keyof typeof Environment]
    : Environment.local;
export const fqdn: string = `${environment}.${domain}.${TLD[environment]}`;
export const githubOrganization: string = process.env.GITHUB_ORGANIZATION || domain;
export const region: Region = getRegion(Environment[environment as keyof typeof Environment]);
export const subdomain: string = `${environment}.${domain}`;
export const tld: TLD = TLD[environment];