import { execSync } from "node:child_process"

export const getBranch = () => {
  const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  process.env.CDK_BRANCH = branch;

  return branch;
};