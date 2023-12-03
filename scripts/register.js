const { exec } = require("child_process");
const { createInterface } = require("readline");
const { promisify } = require("util");

const { branch } = require("./branch")();
const getSSMParmeter = require("./ssmGetParameter");

const client = process.argv[2] || "default";
const id = 1;
const password = "Passw0rd!";
const username = `user+${id}@coada.dev`;

const handler = async () => {
    const cmd = promisify(exec);
    const [webClientId] = await getParams()
        .catch((err) => console.error(err));

    cmd(`awslocal cognito-idp sign-up --client-id ${webClientId} --username ${username} --password ${password} --user-attributes "Name=email,Value=${username}"`)
        .catch((err) => console.error(err))
        .then(() => {
            const rl = createInterface({ input: process.stdin, output: process.stdout });
            rl.question("Enter the confirmation code from your LocalStack logs: ", confirmation => {
                cmd(`awslocal cognito-idp confirm-sign-up --client-id ${webClientId} --username ${username} --confirmation-code ${confirmation}`)
                    .catch((err) => console.error(err))
                    .then(() => {
                        rl.close();
                    });
            });
        });
};

const getParams = async() => {
    return [webClientId] = (await Promise.all([
        getSSMParmeter({
            label: `/cognito/${branch}-${client}-userPoolClientId`
        })
    ])).map(({ Value }) => Value);
};

handler();