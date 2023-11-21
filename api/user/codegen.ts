import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "src/schemas/users.graphql",
  generates: {
    "src/types/users/index.ts": {
      config: {
        contextType: "@functions/graph/handler#Context",
        federation: true,
      },
      plugins: ["typescript", "typescript-resolvers"],
    },
  },
};

export default config;