import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "src/schemas/foo.graphql",
  generates: {
    "src/types/foo/index.ts": {
      config: {
        federation: true,
      },
      plugins: ["typescript", "typescript-resolvers"],
    },
  },
};

export default config;