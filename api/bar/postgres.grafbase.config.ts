import { config, connector, g } from '@grafbase/sdk'

// Welcome to Grafbase!
//
// Configure authentication, data sources, resolvers and caching for your GraphQL API.

// Data Sources - https://grafbase.com/docs/connectors
const database = process.env.AWS_RDS_DATABASE;
const host = process.env.AWS_RDS_HOSTNAME;
const password = process.env.AWS_RDS_PASSWORD;
const port = process.env.AWS_RDS_PORT || 5432;
const username = process.env.AWS_RDS_USERNAME || "username";

const pg = connector.Postgres('Grafbase', {
  url: `postgres://${username}:${password}@${host}:${port}/${database}`
})
g.datasource(pg)

g.extend('GrafbaseBar', {
  modifiedName: {
    args: { name: g.string() },
    returns: g.string(),
    resolver: 'modifiedName'
  }
})

// Resolvers - https://grafbase.com/docs/resolvers

g.query('foo', {
  args: { name: g.string() },
  returns: g.string(),
  resolver: 'foo',
})

export default config({
  schema: g,
  // Authentication - https://grafbase.com/docs/auth
  auth: {
    // OpenID Connect
    // const oidc = auth.OpenIDConnect({ issuer: g.env('OIDC_ISSUER_URL') })
    // providers: [oidc],
    rules: (rules) => {
      rules.public()
    },
  },
  // Caching - https://grafbase.com/docs/graphql-edge-caching
  // cache: {
  //   rules: [
  //     {
  //       types: ['Query'], // Cache everything for 60 seconds
  //       maxAge: 60,
  //       staleWhileRevalidate: 60
  //     }
  //   ]
  // }
})
