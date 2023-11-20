import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "src/schemas/foo.ts",
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