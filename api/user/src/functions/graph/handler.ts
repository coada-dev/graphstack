import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { buildSubgraphSchema } from "@apollo/subgraph";
import { handlers, startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda';
import { Environment, getEnvironment, isProd } from '@cdk/helpers/environment';
import { middyfy } from '@libs/lambda';

import { parse } from 'graphql';

// NOTE: Users
import UsersDataSource from '@models/users';
import UsersTypeDefs from '@schemas/users.graphql';
import UsersResolvers from '@resolvers/users';

export interface Context {
  dataSources: {
    users: UsersDataSource;
  }
}

const environment = getEnvironment(Environment[process.env.NODE_ENV as keyof typeof Environment]);
const isProduction = isProd(environment);

const server = new ApolloServer<Context>({
  introspection: !isProduction,
  plugins: [ApolloServerPluginInlineTrace()],
  schema: buildSubgraphSchema([
    {
      typeDefs: parse(UsersTypeDefs as unknown as string),
      resolvers: UsersResolvers,
    }
  ]),
});

const requestHandler = handlers.createAPIGatewayProxyEventV2RequestHandler();
const serverHandler = startServerAndCreateLambdaHandler(server, requestHandler, {
  context: async() => ({
    dataSources: {
      users: new UsersDataSource(),
    },
  })
});

export default middyfy(serverHandler);