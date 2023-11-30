import { config, connector, g } from '@grafbase/sdk'

// Welcome to Grafbase!
//
// Configure authentication, data sources, resolvers and caching for your GraphQL API.

// Data Sources - https://grafbase.com/docs/connectors
const openapiService = connector.OpenAPI('Grafbase', {
  url: "http://localhost:3001/",
  schema: "http://localhost:8080/bar.yaml"
});

g.datasource(openapiService), { namespace: false };

// Resolvers - https://grafbase.com/docs/resolvers

export default config({
  schema: g,
  auth: {
    rules: (rules) => {
      rules.public()
    },
  },
  federation: {
    version: '2.3'
  }
})
