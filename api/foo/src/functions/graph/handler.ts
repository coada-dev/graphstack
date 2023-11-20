import { middyfy } from '@libs/lambda';

import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { buildSubgraphSchema } from "@apollo/subgraph";
import { handlers, startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda';

import { Environment, getEnvironment, isProd } from '@cdk/helpers/environment';

// NOTE: Foo
import FooTypeDefs from '@schemas/foo';
import FooResolvers from '@resolvers/foo';

const environment = getEnvironment(Environment[process.env.NODE_ENV as keyof typeof Environment]);
const isProduction = isProd(environment);

const server = new ApolloServer({
  introspection: !isProduction,
  plugins: [ApolloServerPluginInlineTrace()],
  schema: buildSubgraphSchema([
    {
      typeDefs: FooTypeDefs,
      resolvers: FooResolvers,
    }
  ]),
});

const requestHandler = handlers.createAPIGatewayProxyEventRequestHandler();
const serverHandler = startServerAndCreateLambdaHandler(server, requestHandler);

export default middyfy(serverHandler);