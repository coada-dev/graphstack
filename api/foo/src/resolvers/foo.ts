import { Resolvers } from "../types/foo";

const resolvers: Resolvers = {
  Query: {
    heyFoo: (_, { name }) => `hey ${name}!`,
  }
};

export default resolvers;