import gql from "graphql-tag";

const typeDefs = gql`
  type Query  {
    heyFoo(name: String): String!
  }
`;

export default typeDefs;