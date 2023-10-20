import { User, Resolvers } from "../types/users";

const resolvers: Resolvers = {
  User: {
    __resolveReference: async ({ id }, { dataSources }) => {
      let response;

      try {
        response = await dataSources.users.getUser(id);
      } catch (error: unknown) {
        throw new Error((<Error>error).message);
      }

      return response;
    },
  },
  Query: {
    getUser: async (_, { id }, { dataSources }): Promise<User> => {
      let response;

      try {
        response = await dataSources.users.getUser(id);
      } catch (error: unknown) {
        throw new Error((<Error>error).message);
      }

      return response;
    },
    heyUser: (_, { name }) => `hey ${name}!`,
  },
  Mutation: {
    createUser: async (_, { id, name }, { dataSources }): Promise<User> => {
      let response;

      try {
        response = await dataSources.users.createUser(id, name);
      } catch (error: unknown) {
        throw new Error((<Error>error).message);
      }

      return response;
    },
    updateUser: async (_, { id, name }, { dataSources }): Promise<User> => {
      let response;

      try {
        response = await dataSources.users.updateUser(id, name);
      } catch (error: unknown) {
        throw new Error((<Error>error).message);
      }

      return response;
    },
  },
};

export default resolvers;