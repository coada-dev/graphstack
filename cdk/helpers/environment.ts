export enum Environment {
  local = "local",
  development = "development",
  test = "test",
  staging = "staging",
  production = "production",
}

export enum TLD {
  local = "localhost",
  development = "dev",
  test = "dev",
  staging = "dev",
  production = "dev",
}

export function getEnvironment(environment: Environment): Environment {
  return environment
    ? Environment[environment as keyof typeof Environment]
    : Environment.local;
}

export const isLocal = (environment: Environment): boolean => {
  return Environment[environment as keyof typeof Environment] ===
    Environment.local;
}

export const isProd = (environment: Environment): boolean => {
  return Environment[environment as keyof typeof Environment] ===
    Environment.production;
}