import { Resolvers } from "../types/foo";

const resolvers: Resolvers = {
  Query: {
    heyFoo: (_, { name }, context) => `hey ${name}!`,
  }
};

export default resolvers;