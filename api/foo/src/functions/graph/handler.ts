import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { buildSubgraphSchema } from "@apollo/subgraph";
import { handlers, startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda';
import { Environment, getEnvironment, isProd } from '@cdk/helpers/environment';
import { middyfy } from '@libs/lambda';

import { parse } from 'graphql';

// NOTE: Foo
import FooTypeDefs from '@schemas/foo.graphql';
import FooResolvers from '@resolvers/foo';

const environment = getEnvironment(Environment[process.env.NODE_ENV as keyof typeof Environment]);

const isProduction = isProd(environment);

const server = new ApolloServer({
  introspection: !isProduction,
  plugins: [ApolloServerPluginInlineTrace()],
  schema: buildSubgraphSchema([
    {
      typeDefs: parse(FooTypeDefs as unknown as string),
      resolvers: FooResolvers,
    }
  ]),
});

const requestHandler = handlers.createAPIGatewayProxyEventV2RequestHandler();
const serverHandler = startServerAndCreateLambdaHandler(server, requestHandler);

export default middyfy(serverHandler);