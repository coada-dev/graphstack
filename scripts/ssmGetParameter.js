const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

module.exports = async(options) => {
    const { label: Name } = options;
    const client = new SSMClient({
        credentials: {
            accessKeyId: "local",
            secretAccessKey: "local"
        },
        endpoint: "http://localhost:4566",
        region: "us-west-2"
    });

    const command = new GetParameterCommand({ Name });
    const { Parameter: { Value } } = await client.send(command);
    return { Value };
};